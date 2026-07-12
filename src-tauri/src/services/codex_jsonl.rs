//! Forward-compatible conversion from `codex exec --json` JSONL events to
//! Oh My Paper's existing stream protocol.
//!
//! Codex owns this wire format; do not deserialize it as `StreamChunk`.
//! Keeping raw event structures here lets the desktop runner tolerate new
//! event and item kinds without losing the rest of a turn.

use std::collections::HashSet;

use serde::Deserialize;
use serde_json::{Map, Value};

use crate::models::{StreamChunk, UsageInfo};

const TOOL_PREVIEW_LIMIT: usize = 1_200;

#[derive(Debug, Deserialize)]
struct CodexJsonlEvent {
    #[serde(rename = "type")]
    event_type: String,
    #[serde(default)]
    thread_id: String,
    #[serde(default)]
    thread: Option<Value>,
    #[serde(default)]
    item: Option<CodexJsonlItem>,
    #[serde(default)]
    usage: Option<CodexUsage>,
    #[serde(default)]
    error: Option<Value>,
    #[serde(flatten)]
    extra: Map<String, Value>,
}

#[derive(Debug, Deserialize)]
struct CodexJsonlItem {
    #[serde(default)]
    id: String,
    #[serde(rename = "type", default)]
    item_type: String,
    #[serde(flatten)]
    fields: Map<String, Value>,
}

#[derive(Debug, Deserialize, Default)]
struct CodexUsage {
    #[serde(default)]
    input_tokens: i64,
    #[serde(default)]
    output_tokens: i64,
    #[serde(default)]
    model: String,
}

/// Stateful parser because a thread id and completed message ids span lines.
pub struct CodexJsonlParser {
    thread_id: Option<String>,
    completed_agent_messages: HashSet<String>,
    selected_model: String,
}

impl CodexJsonlParser {
    pub fn new(selected_model: impl Into<String>) -> Self {
        Self {
            thread_id: None,
            completed_agent_messages: HashSet::new(),
            selected_model: selected_model.into(),
        }
    }

    pub fn parse_line(&mut self, line: &str) -> Result<Vec<StreamChunk>, String> {
        let event: CodexJsonlEvent = serde_json::from_str(line)
            .map_err(|err| format!("invalid Codex JSONL event: {err}"))?;
        self.capture_thread_id(&event);

        match event.event_type.as_str() {
            "thread.started" | "turn.started" => Ok(Vec::new()),
            "item.started" => Ok(event
                .item
                .as_ref()
                .map(item_started_chunks)
                .unwrap_or_default()),
            "item.updated" => Ok(event
                .item
                .as_ref()
                .map(item_updated_chunks)
                .unwrap_or_default()),
            "item.completed" => Ok(event
                .item
                .as_ref()
                .map(|item| self.item_completed_chunks(item))
                .unwrap_or_default()),
            "turn.completed" => Ok(vec![StreamChunk::Done {
                usage: usage_info(event.usage.as_ref(), &self.selected_model),
                remote_session_id: self.thread_id.clone(),
            }]),
            "turn.failed" | "error" => Ok(vec![StreamChunk::Error {
                message: event_error_message(&event),
            }]),
            // Events evolve independently from the desktop release. Unknown
            // kinds are deliberately ignored rather than failing an otherwise
            // successful turn.
            _ => Ok(Vec::new()),
        }
    }

    fn capture_thread_id(&mut self, event: &CodexJsonlEvent) {
        let id = if !event.thread_id.trim().is_empty() {
            Some(event.thread_id.trim().to_string())
        } else {
            event
                .thread
                .as_ref()
                .and_then(|thread| value_text(thread, &["id", "thread_id"]))
                .or_else(|| {
                    event
                        .extra
                        .get("session_id")
                        .and_then(|value| value_text(value, &[]))
                })
        };
        if let Some(id) = id.filter(|id| !id.is_empty()) {
            self.thread_id = Some(id);
        }
    }

    fn item_completed_chunks(&mut self, item: &CodexJsonlItem) -> Vec<StreamChunk> {
        match item.item_type.as_str() {
            "agent_message" => {
                let text = item_text(item);
                if text.trim().is_empty() {
                    return Vec::new();
                }
                let key = if item.id.is_empty() {
                    format!("text:{text}")
                } else {
                    format!("id:{}", item.id)
                };
                if self.completed_agent_messages.insert(key) {
                    vec![StreamChunk::TextDelta { content: text }]
                } else {
                    Vec::new()
                }
            }
            "reasoning" => {
                let text = item_text(item);
                if text.trim().is_empty() {
                    Vec::new()
                } else {
                    vec![
                        StreamChunk::ThinkingDelta { content: text },
                        StreamChunk::ThinkingCommit,
                    ]
                }
            }
            item_type => vec![StreamChunk::ToolCallResult {
                tool_id: display_item_type(item_type),
                tool_use_id: item.id.clone(),
                output: truncate_tool_output(&item_output(item)),
                status: item_status(item),
            }],
        }
    }
}

fn item_started_chunks(item: &CodexJsonlItem) -> Vec<StreamChunk> {
    match item.item_type.as_str() {
        "agent_message" | "reasoning" => Vec::new(),
        item_type => vec![StreamChunk::ToolCallStart {
            tool_id: display_item_type(item_type),
            tool_use_id: item.id.clone(),
            args: Value::Object(item.fields.clone()),
        }],
    }
}

fn item_updated_chunks(item: &CodexJsonlItem) -> Vec<StreamChunk> {
    if item.item_type == "agent_message" || item.item_type == "reasoning" {
        // Codex revisions may send partial content here. Only completed agent
        // messages are shown to avoid duplicate assistant text.
        return Vec::new();
    }

    vec![StreamChunk::ToolProgress {
        tool_use_id: item.id.clone(),
        tool_name: display_item_type(&item.item_type),
        elapsed_seconds: 0.0,
    }]
}

fn usage_info(raw: Option<&CodexUsage>, selected_model: &str) -> UsageInfo {
    let default_usage = CodexUsage::default();
    let raw = raw.unwrap_or(&default_usage);
    UsageInfo {
        input_tokens: raw.input_tokens,
        output_tokens: raw.output_tokens,
        model: if raw.model.trim().is_empty() {
            selected_model.to_string()
        } else {
            raw.model.clone()
        },
    }
}

fn item_status(item: &CodexJsonlItem) -> Option<String> {
    value_text(item.fields.get("status")?, &[])
}

fn item_text(item: &CodexJsonlItem) -> String {
    ["text", "message", "content", "summary"]
        .into_iter()
        .find_map(|key| {
            item.fields
                .get(key)
                .and_then(|value| value_text(value, &["text", "content"]))
        })
        .unwrap_or_default()
}

fn item_output(item: &CodexJsonlItem) -> String {
    [
        "aggregated_output",
        "output",
        "result",
        "content",
        "changes",
        "files",
        "summary",
    ]
    .into_iter()
    .find_map(|key| {
        item.fields
            .get(key)
            .and_then(|value| value_text(value, &["text", "content", "output"]))
    })
    .unwrap_or_else(|| "Completed.".to_string())
}

fn value_text(value: &Value, nested_keys: &[&str]) -> Option<String> {
    match value {
        Value::String(text) => Some(text.clone()),
        Value::Array(values) => {
            let parts: Vec<String> = values
                .iter()
                .filter_map(|entry| value_text(entry, nested_keys))
                .filter(|text| !text.is_empty())
                .collect();
            (!parts.is_empty()).then(|| parts.join("\n"))
        }
        Value::Object(map) => nested_keys
            .iter()
            .find_map(|key| {
                map.get(*key)
                    .and_then(|nested| value_text(nested, nested_keys))
            })
            .or_else(|| serde_json::to_string(value).ok()),
        Value::Null => None,
        other => Some(other.to_string()),
    }
}

fn display_item_type(item_type: &str) -> String {
    match item_type {
        "command_execution" => "command".into(),
        "file_change" => "file_change".into(),
        "mcp_tool_call" => "mcp".into(),
        "web_search" => "web".into(),
        "plan" => "plan".into(),
        other if other.trim().is_empty() => "codex_item".into(),
        other => other.to_string(),
    }
}

fn truncate_tool_output(text: &str) -> String {
    if text.chars().count() <= TOOL_PREVIEW_LIMIT {
        return text.to_string();
    }
    let mut preview: String = text.chars().take(TOOL_PREVIEW_LIMIT).collect();
    preview.push_str("… (truncated)");
    preview
}

fn event_error_message(event: &CodexJsonlEvent) -> String {
    event
        .error
        .as_ref()
        .and_then(|value| value_text(value, &["message", "error", "detail"]))
        .or_else(|| {
            event
                .extra
                .get("message")
                .and_then(|value| value_text(value, &[]))
        })
        .filter(|message| !message.trim().is_empty())
        .unwrap_or_else(|| "Codex turn failed without an error message.".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_complete_jsonl_fixture_and_persists_thread_id() {
        let fixture = include_str!("../../tests/fixtures/codex/complete-turn.jsonl");
        let mut parser = CodexJsonlParser::new("gpt-5.4");
        let chunks: Vec<StreamChunk> = fixture
            .lines()
            .flat_map(|line| parser.parse_line(line).expect("valid fixture"))
            .collect();

        assert!(chunks.iter().any(|chunk| matches!(
            chunk,
            StreamChunk::ToolCallStart { tool_id, tool_use_id, .. }
                if tool_id == "command" && tool_use_id == "cmd-1"
        )));
        assert!(chunks.iter().any(|chunk| matches!(
            chunk,
            StreamChunk::TextDelta { content } if content == "The task is complete."
        )));
        assert!(chunks.iter().any(|chunk| matches!(
            chunk,
            StreamChunk::Done { usage, remote_session_id }
                if usage.input_tokens == 123
                    && usage.output_tokens == 45
                    && remote_session_id.as_deref() == Some("thread-abc")
        )));
    }

    #[test]
    fn preserves_partial_turn_when_fixture_contains_unknown_and_malformed_lines() {
        let fixture = include_str!("../../tests/fixtures/codex/failure-and-malformed.jsonl");
        let mut parser = CodexJsonlParser::new("gpt-5.4");
        let mut decode_errors = 0;
        let mut chunks = Vec::new();
        for line in fixture.lines() {
            match parser.parse_line(line) {
                Ok(mut parsed) => chunks.append(&mut parsed),
                Err(_) => decode_errors += 1,
            }
        }

        assert_eq!(decode_errors, 1);
        assert!(chunks.iter().any(|chunk| matches!(
            chunk,
            StreamChunk::TextDelta { content } if content == "Partial answer."
        )));
        assert!(chunks.iter().any(|chunk| matches!(
            chunk,
            StreamChunk::Error { message } if message == "workspace permission denied"
        )));
    }

    #[test]
    fn completed_agent_messages_are_not_appended_twice() {
        let mut parser = CodexJsonlParser::new("gpt-5.4");
        let line = r#"{"type":"item.completed","item":{"id":"message-1","type":"agent_message","text":"Once."}}"#;
        assert_eq!(parser.parse_line(line).expect("first").len(), 1);
        assert!(parser.parse_line(line).expect("duplicate").is_empty());
    }

    #[test]
    fn truncates_large_tool_output() {
        let text = "x".repeat(TOOL_PREVIEW_LIMIT + 1);
        assert!(truncate_tool_output(&text).ends_with("… (truncated)"));
    }
}
