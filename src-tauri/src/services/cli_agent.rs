use std::ffi::OsStr;
use std::io::Write;
use std::path::PathBuf;
use std::process::{Child, ChildStdin, Command, Stdio};

use anyhow::{bail, Context, Result};

use crate::state::AppState;

/// Settings resolved by the chat UI for a single CLI run.
#[derive(Debug, Clone, Default)]
pub struct CliRunOptions {
    pub model: String,
    pub reasoning_effort: Option<String>,
}

/// Spawn a Claude Code or Codex CLI child process.
///
/// Codex's non-interactive interface is intentionally separate from Claude's:
/// it runs `codex exec --json`, reads the prompt from stdin, and resumes with
/// `codex exec resume`. Do not add a prompt as a command-line argument: long
/// prompts and Windows quoting otherwise make invocation unreliable.
pub fn spawn_cli_agent(
    state: &AppState,
    vendor: &str,
    user_message: &str,
    project_root: &str,
    system_prompt: &str,
    remote_session_id: Option<&str>,
    options: &CliRunOptions,
) -> Result<(Child, ChildStdin)> {
    let enriched_path = crate::services::enriched_path();

    let mut cmd = match vendor {
        "codex" => build_codex_command(
            resolve_cli_executable("codex", OsStr::new(&enriched_path))?,
            project_root,
            remote_session_id,
            options,
        )?,
        _ => build_claude_command(
            resolve_cli_executable("claude", OsStr::new(&enriched_path))?,
            user_message,
            project_root,
            system_prompt,
            remote_session_id,
        ),
    };

    if !project_root.is_empty() {
        cmd.current_dir(project_root);
    }

    cmd.env("PATH", &enriched_path);
    cmd.stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    // Make cancellation target the complete CLI process tree. Windows needs
    // taskkill /T (in agent::cancel_agent); the group flag gives it a distinct
    // process group when the CLI launches child tools.
    configure_process_group(&mut cmd);

    state
        .sidecar_cancelled
        .store(false, std::sync::atomic::Ordering::SeqCst);

    let mut child = cmd.spawn().with_context(|| {
        format!(
            "failed to spawn CLI agent '{}'. Is it installed and on PATH?",
            if vendor == "codex" { "codex" } else { "claude" }
        )
    })?;

    let mut stdin = child.stdin.take().context("CLI agent stdin unavailable")?;
    if vendor == "codex" {
        let prompt = compose_codex_stdin_prompt(system_prompt, user_message);
        stdin
            .write_all(prompt.as_bytes())
            .context("failed to write Codex prompt to stdin")?;
        // EOF tells `codex exec -` that the complete prompt has arrived. The
        // handle is returned only for API compatibility with the Claude path;
        // callers immediately drop it for Codex.
        stdin.flush().context("failed to flush Codex prompt")?;
    }

    Ok((child, stdin))
}

fn build_claude_command(
    executable: PathBuf,
    user_message: &str,
    project_root: &str,
    system_prompt: &str,
    remote_session_id: Option<&str>,
) -> Command {
    let mut cmd = Command::new(executable);
    cmd.args([
        "-p",
        user_message,
        "--print",
        "--output-format",
        "stream-json",
    ]);
    if let Some(rsid) = remote_session_id.filter(|value| !value.is_empty()) {
        cmd.args(["--resume", rsid]);
    }
    if !system_prompt.is_empty() {
        cmd.args(["--append-system-prompt", system_prompt]);
    }
    if !project_root.is_empty() {
        cmd.current_dir(project_root);
    }
    cmd
}

fn build_codex_command(
    executable: PathBuf,
    project_root: &str,
    remote_session_id: Option<&str>,
    options: &CliRunOptions,
) -> Result<Command> {
    let args = build_codex_args(project_root, remote_session_id, options)?;
    let mut cmd = Command::new(executable);
    cmd.args(args);
    Ok(cmd)
}

/// Construct arguments for the Codex CLI version installed by the user.
///
/// `codex exec resume --help` in Codex CLI 0.144.0 does not expose `--sandbox`
/// or `-C`; a resumed run therefore inherits its stored sandbox policy while
/// this process's current directory supplies the project root.
pub fn build_codex_args(
    project_root: &str,
    remote_session_id: Option<&str>,
    options: &CliRunOptions,
) -> Result<Vec<String>> {
    let mut args = vec!["exec".to_string()];
    let resuming = remote_session_id.is_some_and(|value| !value.trim().is_empty());
    if resuming {
        args.push("resume".to_string());
    }

    args.push("--json".to_string());
    if !options.model.trim().is_empty() {
        args.extend(["--model".to_string(), options.model.trim().to_string()]);
    }
    if let Some(effort) = options
        .reasoning_effort
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        if !is_supported_reasoning_effort(effort) {
            bail!("unsupported Codex reasoning effort: {effort}");
        }
        args.extend([
            "--config".to_string(),
            format!("model_reasoning_effort=\"{effort}\""),
        ]);
    }

    if let Some(session_id) = remote_session_id.filter(|value| !value.trim().is_empty()) {
        args.push(session_id.to_string());
    } else {
        args.extend(["--sandbox".to_string(), "workspace-write".to_string()]);
        if !project_root.trim().is_empty() {
            args.extend(["--cd".to_string(), project_root.to_string()]);
        }
    }

    // `-` selects stdin rather than the shell-command overload of `exec`.
    args.push("-".to_string());
    Ok(args)
}

fn is_supported_reasoning_effort(value: &str) -> bool {
    matches!(
        value,
        "minimal" | "low" | "medium" | "high" | "xhigh" | "max"
    )
}

fn compose_codex_stdin_prompt(system_prompt: &str, user_message: &str) -> String {
    let system_prompt = system_prompt.trim();
    let user_message = user_message.trim();
    match (system_prompt.is_empty(), user_message.is_empty()) {
        (true, true) => String::new(),
        (true, false) => user_message.to_string(),
        (false, true) => system_prompt.to_string(),
        (false, false) => format!(
            "<oh_my_paper_context>\n{system_prompt}\n</oh_my_paper_context>\n\n{user_message}"
        ),
    }
}

/// Resolve the actual executable before spawning it so Windows npm shims such
/// as `codex.cmd` work even when the desktop application's PATH is minimal.
fn resolve_cli_executable(cli: &str, path_env: &OsStr) -> Result<PathBuf> {
    let env_keys: &[&str] = match cli {
        "codex" => &["OMP_CODEX_PATH", "CODEX_CLI_PATH"],
        _ => &["OMP_CLAUDE_PATH", "CLAUDE_CLI_PATH", "CLAUDE_CODE_PATH"],
    };
    for key in env_keys {
        if let Ok(value) = std::env::var(key) {
            let candidate = PathBuf::from(value.trim());
            if candidate.is_file() {
                return Ok(candidate);
            }
        }
    }

    let located = locate_on_path(cli, path_env)
        .or_else(|| common_cli_locations(cli).into_iter().find(|p| p.is_file()));
    located.ok_or_else(|| anyhow::anyhow!("{cli} CLI executable was not found"))
}

fn locate_on_path(cli: &str, path_env: &OsStr) -> Option<PathBuf> {
    #[cfg(windows)]
    let output = Command::new("where.exe")
        .arg(cli)
        .env("PATH", path_env)
        .output()
        .ok()?;
    #[cfg(not(windows))]
    let output = Command::new("which")
        .arg(cli)
        .env("PATH", path_env)
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }
    String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(str::trim)
        .filter(|path| !path.is_empty())
        .map(PathBuf::from)
        .find(|path| path.is_file())
}

fn common_cli_locations(cli: &str) -> Vec<PathBuf> {
    #[cfg(windows)]
    {
        let mut locations = Vec::new();
        if let Ok(app_data) = std::env::var("APPDATA") {
            locations.push(
                PathBuf::from(app_data)
                    .join("npm")
                    .join(format!("{cli}.cmd")),
            );
        }
        if let Ok(program_files) = std::env::var("ProgramFiles") {
            locations.push(
                PathBuf::from(program_files)
                    .join("nodejs")
                    .join(format!("{cli}.cmd")),
            );
        }
        locations
    }
    #[cfg(not(windows))]
    {
        vec![
            PathBuf::from("/opt/homebrew/bin").join(cli),
            PathBuf::from("/usr/local/bin").join(cli),
            PathBuf::from("/usr/bin").join(cli),
        ]
    }
}

fn configure_process_group(cmd: &mut Command) {
    #[cfg(unix)]
    {
        use std::os::unix::process::CommandExt;
        cmd.process_group(0);
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NEW_PROCESS_GROUP: u32 = 0x0000_0200;
        cmd.creation_flags(CREATE_NEW_PROCESS_GROUP);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    #[test]
    fn new_codex_session_uses_exec_json_stdin_and_project_root() {
        let args = build_codex_args(
            "C:/paper project",
            None,
            &CliRunOptions {
                model: "gpt-5.4".into(),
                reasoning_effort: Some("high".into()),
            },
        )
        .expect("build args");
        assert_eq!(
            args,
            vec![
                "exec",
                "--json",
                "--model",
                "gpt-5.4",
                "--config",
                "model_reasoning_effort=\"high\"",
                "--sandbox",
                "workspace-write",
                "--cd",
                "C:/paper project",
                "-",
            ]
        );
    }

    #[test]
    fn resumed_codex_session_uses_current_cli_contract() {
        let args = build_codex_args(
            "C:/paper project",
            Some("thread-123"),
            &CliRunOptions {
                model: "gpt-5.4".into(),
                reasoning_effort: None,
            },
        )
        .expect("build args");
        assert_eq!(
            args,
            vec![
                "exec",
                "resume",
                "--json",
                "--model",
                "gpt-5.4",
                "thread-123",
                "-"
            ]
        );
        assert!(!args.iter().any(|arg| arg == "--sandbox" || arg == "--cd"));
    }

    #[test]
    fn empty_model_and_effort_leave_codex_defaults_intact() {
        let args =
            build_codex_args("C:/paper", None, &CliRunOptions::default()).expect("build args");
        assert_eq!(
            args,
            vec![
                "exec",
                "--json",
                "--sandbox",
                "workspace-write",
                "--cd",
                "C:/paper",
                "-"
            ]
        );
    }

    #[test]
    fn codex_prompt_keeps_context_out_of_shell_arguments() {
        assert_eq!(
            compose_codex_stdin_prompt("Follow evidence rules.", "Update tasks.json"),
            "<oh_my_paper_context>\nFollow evidence rules.\n</oh_my_paper_context>\n\nUpdate tasks.json"
        );
    }

    #[test]
    fn accepts_windows_cmd_path_as_resolved_executable() {
        let path = Path::new(r"C:\\Users\\example\\AppData\\Roaming\\npm\\codex.cmd");
        assert_eq!(path.extension().and_then(|ext| ext.to_str()), Some("cmd"));
    }

    #[cfg(unix)]
    #[test]
    fn unix_fake_executable_can_be_started_by_resolved_path() {
        use std::os::unix::fs::PermissionsExt;

        let dir = std::env::temp_dir().join(format!("omp-codex-fake-{}", std::process::id()));
        std::fs::create_dir_all(&dir).expect("create fake binary directory");
        let executable = dir.join("codex");
        std::fs::write(&executable, "#!/bin/sh\nprintf fake-codex\n").expect("write fake binary");
        let mut permissions = std::fs::metadata(&executable)
            .expect("metadata")
            .permissions();
        permissions.set_mode(0o755);
        std::fs::set_permissions(&executable, permissions).expect("mark executable");

        let output = Command::new(&executable).output().expect("run fake binary");
        assert!(output.status.success());
        assert_eq!(String::from_utf8_lossy(&output.stdout).trim(), "fake-codex");
        let path_env = std::env::join_paths([dir.as_path()]).expect("fake binary PATH");
        assert_eq!(
            locate_on_path("codex", path_env.as_os_str()),
            Some(executable.clone())
        );
        std::fs::remove_file(&executable).expect("remove fake binary");
        std::fs::remove_dir(&dir).expect("remove fake binary directory");
    }

    #[cfg(windows)]
    #[test]
    fn windows_cmd_fake_executable_can_be_started_by_resolved_path() {
        let dir = std::env::temp_dir().join(format!("omp-codex-fake-{}", std::process::id()));
        std::fs::create_dir_all(&dir).expect("create fake cmd directory");
        let executable = dir.join("codex.cmd");
        std::fs::write(&executable, "@echo off\r\necho fake-codex\r\n").expect("write fake cmd");

        let output = Command::new(&executable).output().expect("run fake cmd");
        assert!(output.status.success());
        assert_eq!(String::from_utf8_lossy(&output.stdout).trim(), "fake-codex");
        let path_env = std::env::join_paths([dir.as_path()]).expect("fake cmd PATH");
        assert_eq!(
            locate_on_path("codex", path_env.as_os_str()),
            Some(executable.clone())
        );
        std::fs::remove_file(&executable).expect("remove fake cmd");
        std::fs::remove_dir(&dir).expect("remove fake cmd directory");
    }
}
