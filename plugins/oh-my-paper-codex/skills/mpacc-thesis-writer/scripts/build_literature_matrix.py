#!/usr/bin/env python3
"""Build a sortable MPAcc literature matrix from user-provided references.

The script never fetches or invents sources. It only restructures entries already
present in a CSV, BibTeX, or plain-text bibliography file.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import re
from pathlib import Path


COLUMNS = [
    "编号",
    "作者",
    "年份",
    "题名",
    "研究主题",
    "研究对象",
    "研究方法",
    "核心观点",
    "关键结论",
    "适合章节",
    "可支持论点",
    "相关性评分",
    "权威性评分",
    "新近性评分",
    "是否核心引用",
]


THEME_KEYWORDS = [
    ("预算管理", ["预算", "budget"]),
    ("成本管理", ["成本", "cost"]),
    ("内部控制", ["内部控制", "内控", "control"]),
    ("风险管理", ["风险", "违约", "预警", "risk", "default", "warning"]),
    ("审计", ["审计", "audit"]),
    ("绩效评价", ["绩效", "performance"]),
    ("数字化转型", ["数字", "数智", "RPA", "AI", "机器学习", "大数据", "text", "文本"]),
    ("数据资产", ["数据资产", "数据资源"]),
    ("碳会计", ["碳", "carbon", "环境"]),
    ("混合所有制/治理", ["混改", "治理", "股权", "CSR", "社会责任"]),
]


METHOD_KEYWORDS = [
    ("案例分析", ["案例", "case"]),
    ("比较分析", ["比较", "contrast", "comparative"]),
    ("事件研究", ["事件研究", "event study"]),
    ("fsQCA", ["fsQCA", "QCA", "组态"]),
    ("机器学习", ["机器学习", "随机森林", "神经网络", "SVM", "支持向量机", "ML"]),
    ("文本分析", ["文本", "MD&A", "语调"]),
    ("社会网络分析", ["社会网络", "SNA", "network"]),
    ("AHP/指标赋权", ["层次分析", "AHP", "熵权"]),
    ("会计处理规范分析", ["确认", "计量", "列报", "披露", "准则"]),
]


AUTHORITY_MARKERS = [
    "会计研究",
    "审计研究",
    "财务研究",
    "管理世界",
    "经济研究",
    "CSSCI",
    "核心",
    "Accounting",
    "Finance",
    "Auditing",
]


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def extract_year(text: str) -> str:
    years = re.findall(r"(?:19|20)\d{2}", text or "")
    return years[-1] if years else ""


def parse_plain_line(line: str) -> dict[str, str]:
    original = normalize(re.sub(r"^\s*(?:\[\d+\]|\d+[\.\s、])\s*", "", line))
    year = extract_year(original)
    author = ""
    title = original

    # GB/T-like: Author. Title[J]. Journal, Year...
    parts = re.split(r"[.．]", original, maxsplit=2)
    if len(parts) >= 2 and len(parts[0]) <= 80:
        author = normalize(parts[0])
        title = normalize(parts[1])
    else:
        m = re.search(r"《([^》]+)》", original)
        if m:
            title = m.group(1)
        elif year:
            title = normalize(original.split(year, 1)[0])

    return {"raw": original, "作者": author, "年份": year, "题名": title}


def parse_bibtex(text: str) -> list[dict[str, str]]:
    entries: list[dict[str, str]] = []
    for block in re.findall(r"@\w+\s*\{.*?\n\}", text, flags=re.S):
        fields = {}
        for key, value in re.findall(r"(\w+)\s*=\s*[\{\"](.+?)[\}\"]\s*,?", block, flags=re.S):
            fields[key.lower()] = normalize(value.replace("\n", " "))
        raw = normalize(block)
        entries.append(
            {
                "raw": raw,
                "作者": fields.get("author", ""),
                "年份": fields.get("year", extract_year(raw)),
                "题名": fields.get("title", raw[:80]),
            }
        )
    return entries


def load_entries(path: Path) -> list[dict[str, str]]:
    text = path.read_text(encoding="utf-8-sig")
    if path.suffix.lower() == ".bib" or text.lstrip().startswith("@"):
        return parse_bibtex(text)

    if path.suffix.lower() == ".csv":
        with path.open(newline="", encoding="utf-8-sig") as f:
            rows = list(csv.DictReader(f))
        entries = []
        for row in rows:
            raw = " ".join(normalize(v) for v in row.values() if v)
            entries.append(
                {
                    "raw": raw,
                    "作者": row.get("作者") or row.get("author") or row.get("Author") or "",
                    "年份": row.get("年份") or row.get("year") or row.get("Year") or extract_year(raw),
                    "题名": row.get("题名") or row.get("title") or row.get("Title") or raw[:80],
                }
            )
        return entries

    return [parse_plain_line(line) for line in text.splitlines() if normalize(line)]


def infer_from_keywords(text: str, mapping: list[tuple[str, list[str]]], default: str) -> str:
    lowered = text.lower()
    hits = []
    for label, keys in mapping:
        if any(k.lower() in lowered for k in keys):
            hits.append(label)
    return "；".join(dict.fromkeys(hits)) if hits else default


def chapter_hint(theme: str) -> str:
    if any(k in theme for k in ["理论", "文献"]):
        return "第2章"
    if any(k in theme for k in ["风险", "成本", "预算", "内部控制", "审计"]):
        return "第3-5章"
    if any(k in theme for k in ["绩效", "治理", "混合", "数字化", "碳会计", "数据资产"]):
        return "第2-5章"
    return "第1-2章"


def score_relevance(raw: str, title: str, topic_keywords: list[str]) -> int:
    if not topic_keywords:
        return 3
    haystack = f"{raw} {title}".lower()
    hits = sum(1 for kw in topic_keywords if kw.lower() in haystack)
    return max(1, min(5, 2 + hits))


def score_authority(raw: str) -> int:
    hits = sum(1 for marker in AUTHORITY_MARKERS if marker.lower() in raw.lower())
    return max(2, min(5, 2 + hits))


def score_recency(year: str) -> int:
    if not year:
        return 2
    age = dt.datetime.now().year - int(year)
    if age <= 3:
        return 5
    if age <= 6:
        return 4
    if age <= 10:
        return 3
    return 2


def build_matrix(entries: list[dict[str, str]], topic_keywords: list[str]) -> list[dict[str, str]]:
    rows = []
    for index, entry in enumerate(entries, 1):
        raw = normalize(entry.get("raw", ""))
        title = normalize(entry.get("题名", "")) or raw[:80]
        theme = infer_from_keywords(f"{raw} {title}", THEME_KEYWORDS, "待人工归类")
        method = infer_from_keywords(f"{raw} {title}", METHOD_KEYWORDS, "待人工判断")
        relevance = score_relevance(raw, title, topic_keywords)
        authority = score_authority(raw)
        recency = score_recency(entry.get("年份", ""))
        rows.append(
            {
                "编号": str(index),
                "作者": normalize(entry.get("作者", "")) or "〔待补：作者〕",
                "年份": entry.get("年份", "") or "〔待补：年份〕",
                "题名": title or "〔待补：题名〕",
                "研究主题": theme,
                "研究对象": "〔待补：研究对象〕",
                "研究方法": method,
                "核心观点": "〔待补：核心观点〕",
                "关键结论": "〔待补：关键结论〕",
                "适合章节": chapter_hint(theme),
                "可支持论点": "〔待补：可支持论点〕",
                "相关性评分": str(relevance),
                "权威性评分": str(authority),
                "新近性评分": str(recency),
                "是否核心引用": "是" if relevance + authority + recency >= 12 else "否",
            }
        )
    return rows


def main() -> int:
    parser = argparse.ArgumentParser(description="Build an MPAcc literature matrix from supplied references.")
    parser.add_argument("input", type=Path, help="CSV, BibTeX, or plain-text bibliography supplied by the user")
    parser.add_argument("--output", "-o", type=Path, default=Path("literature_matrix.csv"))
    parser.add_argument("--topic-keywords", default="", help="Comma-separated thesis keywords for relevance scoring")
    args = parser.parse_args()

    topic_keywords = [normalize(x) for x in re.split(r"[,，;；]", args.topic_keywords) if normalize(x)]
    entries = load_entries(args.input)
    rows = build_matrix(entries, topic_keywords)

    with args.output.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
