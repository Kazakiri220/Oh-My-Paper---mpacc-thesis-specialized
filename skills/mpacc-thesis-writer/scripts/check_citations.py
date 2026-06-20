#!/usr/bin/env python3
"""Check sequential numeric citations in MPAcc thesis markdown/text files."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


CITATION_RE = re.compile(r"\[([0-9][0-9,\s，;；\-–—~～]*)\]")
REFERENCE_LINE_RE = re.compile(r"^\s*(?:\[(\d+)\]|(\d+)[\.、\s])\s*(.+?)\s*$")


def normalize(text: str) -> str:
    return re.sub(r"\s+", "", text or "").lower()


def expand_citation_group(group: str) -> set[int]:
    numbers: set[int] = set()
    for part in re.split(r"[,，;；]\s*", group):
        part = part.strip()
        if not part:
            continue
        m = re.match(r"^(\d+)\s*[-–—~～]\s*(\d+)$", part)
        if m:
            start, end = int(m.group(1)), int(m.group(2))
            if start <= end:
                numbers.update(range(start, end + 1))
            else:
                numbers.update(range(end, start + 1))
        elif part.isdigit():
            numbers.add(int(part))
    return numbers


def extract_cited_numbers(text: str) -> set[int]:
    cited: set[int] = set()
    for match in CITATION_RE.finditer(text):
        cited.update(expand_citation_group(match.group(1)))
    return cited


def extract_references(text: str) -> dict[int, str]:
    refs: dict[int, str] = {}
    in_refs = False
    for line in text.splitlines():
        if "参考文献" in line:
            in_refs = True
            continue
        match = REFERENCE_LINE_RE.match(line)
        if match and (in_refs or len(refs) > 0):
            num = int(match.group(1) or match.group(2))
            refs[num] = match.group(3).strip()
    if refs:
        return refs

    # Fallback: parse reference-like lines anywhere.
    for line in text.splitlines():
        match = REFERENCE_LINE_RE.match(line)
        if match:
            num = int(match.group(1) or match.group(2))
            refs[num] = match.group(3).strip()
    return refs


def split_body_and_references(text: str) -> tuple[str, str]:
    lines = text.splitlines()
    for index, line in enumerate(lines):
        if "参考文献" in line or re.match(r"^\s*references\s*$", line, flags=re.I):
            return "\n".join(lines[:index]), "\n".join(lines[index:])
    return text, text


def load_allowed(path: Path | None) -> list[str]:
    if not path:
        return []
    text = path.read_text(encoding="utf-8-sig")
    return [line.strip() for line in text.splitlines() if line.strip()]


def reference_in_allowed(reference: str, allowed: list[str]) -> bool:
    if not allowed:
        return True
    ref_norm = normalize(reference)
    if not ref_norm:
        return False
    for item in allowed:
        item_norm = normalize(item)
        if ref_norm in item_norm or item_norm in ref_norm:
            return True
        title_bits = [bit for bit in re.split(r"[.．\[\]【】]", reference) if len(normalize(bit)) >= 6]
        if any(normalize(bit) in item_norm for bit in title_bits):
            return True
    return False


def analyze(paths: list[Path], allowed: list[str]) -> tuple[list[str], int]:
    combined = "\n".join(path.read_text(encoding="utf-8-sig") for path in paths)
    body_text, reference_text = split_body_and_references(combined)
    cited = extract_cited_numbers(body_text)
    refs = extract_references(reference_text)
    ref_numbers = set(refs)
    messages: list[str] = []

    messages.append(f"Cited numbers: {sorted(cited) if cited else 'none'}")
    messages.append(f"Reference numbers: {sorted(ref_numbers) if ref_numbers else 'none'}")

    missing_refs = sorted(cited - ref_numbers)
    unused_refs = sorted(ref_numbers - cited)
    if missing_refs:
        messages.append(f"ERROR cited but missing from reference list: {missing_refs}")
    if unused_refs:
        messages.append(f"WARN listed but not cited: {unused_refs}")

    if ref_numbers:
        expected = set(range(1, max(ref_numbers) + 1))
        gaps = sorted(expected - ref_numbers)
        if gaps:
            messages.append(f"ERROR reference numbering gaps: {gaps}")

    if allowed:
        unknown = [num for num, ref in refs.items() if not reference_in_allowed(ref, allowed)]
        if unknown:
            messages.append(f"ERROR references not found in allowed literature file: {unknown}")

    error_count = sum(1 for msg in messages if msg.startswith("ERROR"))
    if not error_count:
        messages.append("OK citation numbering checks passed.")
    return messages, error_count


def main() -> int:
    parser = argparse.ArgumentParser(description="Check in-text numeric citations against a reference list.")
    parser.add_argument("files", nargs="+", type=Path, help="Draft markdown/text files to check")
    parser.add_argument("--allowed", type=Path, help="Optional user-provided bibliography to flag unapproved references")
    args = parser.parse_args()

    allowed = load_allowed(args.allowed)
    messages, error_count = analyze(args.files, allowed)
    print("\n".join(messages))
    return 1 if error_count else 0


if __name__ == "__main__":
    sys.exit(main())
