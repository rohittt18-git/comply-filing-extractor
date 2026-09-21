import re
from statistics import median
from typing import List, Dict, Any


def group_lines_into_rows(
    lines: List[Dict[str, Any]],
    y_tolerance: float = 3.0
) -> List[List[Dict[str, Any]]]:

    if not lines:
        return []

    sorted_lines = sorted(
        lines,
        key=lambda x: (x["y0"], x["x0"])
    )

    rows = []

    for line in sorted_lines:
        placed = False

        for row in rows:
            avg_y = sum(item["y0"] for item in row) / len(row)

            if abs(line["y0"] - avg_y) <= y_tolerance:
                row.append(line)
                placed = True
                break

        if not placed:
            rows.append([line])

    for row in rows:
        row.sort(key=lambda x: x["x0"])

    return rows


def normalize_row(row: List[Dict[str, Any]]) -> str:
    """
    Convert visually ordered PDF fragments into readable text.
    """

    if not row:
        return ""

    row = sorted(row, key=lambda x: x["x0"])

    parts = []

    for item in row:
        text = item["text"].strip()

        if not text:
            continue

        if not parts:
            parts.append(text)
            continue

        previous = parts[-1]

        # Join fragments that visually belong together
        parts.append(text)

    return " ".join(parts)


def normalize_page(lines: List[Dict[str, Any]]) -> List[str]:
    rows = group_lines_into_rows(lines)

    result = []

    for row in rows:
        text = normalize_row(row)

        if text.strip():
            result.append(text.strip())

    return result


COMMON_HEADINGS = {
    "table of contents",
    "filing at a glance",
    "general information",
    "company and contact",
    "filing contact information",
    "filing company information",
    "filing description",
    "filing fees",
    "state fees",
    "correspondence summary",
    "dispositions",
    "objection letters",
    "response letters",
    "objection letters and response letters",
    "filing notes",
    "note to reviewer",
    "note to filer",
    "disposition",
    "schedule",
    "supporting document schedules",
    "supporting document schedule",
    "objection letter",
    "response letter",
    "introduction",
    "comments",
    "comment",
    "conclusion",
    "changed items",
    "extension request",
    "amendment",
    "amendment letter",
    "background",
    "overview",
    "summary",
    "analysis",
    "discussion",
    "recommendation",
    "recommendations",
    "appendix",
    "appendices",
    "exhibits",
    "references",
    "definitions",
    "purpose",
    "scope",
}


TABLE_WORDS = {
    "item",
    "items",
    "amount",
    "status",
    "name",
    "number",
    "type",
    "action",
    "subject",
    "date",
    "year",
    "years",
    "form",
    "score",
    "comments",
    "description",
    "created by",
    "created on",
    "public access",
    "attachments",
    "supporting document",
    "schedule item",
    "schedule item status",
    "schedule item name",
    "bypass reason",
    "item status",
    "status date",
}


METADATA_PREFIXES = (
    "serff tracking",
    "state tracking",
    "company tracking",
    "filing company:",
    "state:",
    "toi/sub-toi:",
    "product name:",
    "project name/number:",
    "pdf pipeline for serff",
    "generated ",
    "created by:",
    "created on:",
    "date submitted:",
    "submitted by:",
    "submitted on:",
    "last edited by:",
)


def normalize_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def word_count(text: str) -> int:
    return len(
        normalize_text(text).split()
    )


def looks_like_sentence(text: str) -> bool:
    value = normalize_text(text)

    if not value:
        return False

    if value.endswith(
        (".", ",", ";", ":", "?", "!")
    ):
        return True

    if word_count(value) > 18:
        return True

    return False


def looks_like_metadata(text: str) -> bool:
    value = normalize_text(text).lower()

    return value.startswith(
        METADATA_PREFIXES
    )


def looks_like_table_label(text: str) -> bool:
    value = normalize_text(text).lower()

    return value in TABLE_WORDS


def looks_like_filename(text: str) -> bool:
    value = normalize_text(text).lower()

    return value.endswith(
        (
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
        )
    )


def looks_like_numbered_body(text: str) -> bool:
    """
    A numbered line is NOT automatically a heading.

    This prevents correspondence sentences such as:
    '1. The second sentence...'
    from becoming headings.
    """

    value = normalize_text(text)

    return bool(
        re.match(
            r"^\d+[\.\)]\s+.+",
            value,
        )
    )


def is_known_heading(text: str) -> bool:
    return (
        normalize_text(text).lower()
        in COMMON_HEADINGS
    )


def is_correspondence_heading(text: str) -> bool:
    value = normalize_text(text).lower()

    patterns = [
        r"^objection\s+\d+$",
        r"^response\s+\d+$",
        r"^related\s+objection\s+\d+$",
        r"^amendment\s+\d+$",
        r"^exhibit\s+[a-z0-9]+$",
    ]

    return any(
        re.fullmatch(pattern, value)
        for pattern in patterns
    )


def is_all_caps(text: str) -> bool:
    value = normalize_text(text)

    letters = [
        char
        for char in value
        if char.isalpha()
    ]

    if len(letters) < 3:
        return False

    return all(
        char.isupper()
        for char in letters
    )


def is_title_case(text: str) -> bool:
    words = normalize_text(text).split()

    if not words or len(words) > 12:
        return False

    ignored = {
        "a",
        "an",
        "and",
        "as",
        "at",
        "by",
        "for",
        "from",
        "in",
        "of",
        "on",
        "or",
        "the",
        "to",
        "with",
    }

    meaningful = [
        word
        for word in words
        if word.lower() not in ignored
    ]

    if not meaningful:
        return False

    capitalized = sum(
        1
        for word in meaningful
        if word[0].isupper()
    )

    return (
        capitalized / len(meaningful)
        >= 0.70
    )


def document_median_font_size(
    lines: list,
) -> float:
    sizes = [
        line.get("font_size", 0)
        for line in lines
        if line.get("font_size", 0) > 0
    ]

    if not sizes:
        return 10.0

    return median(sizes)


def heading_score(
    line: dict,
    all_lines: list,
    inside_table: bool = False,
) -> int:

    text = normalize_text(
        line.get("text", "")
    )

    if not text:
        return -999

    score = 0

    lower = text.lower()

    font_size = line.get(
        "font_size",
        0,
    )

    bold = line.get(
        "is_bold",
        False,
    )

    median_size = document_median_font_size(
        all_lines
    )

    # ------------------------------------------
    # Strong structural words
    # ------------------------------------------

    if is_known_heading(text):
        score += 8

    if is_correspondence_heading(text):
        score += 7

    # ------------------------------------------
    # Table protection
    # ------------------------------------------

    if inside_table:
        score -= 12

    if looks_like_table_label(text):
        score -= 8

    # ------------------------------------------
    # Metadata protection
    # ------------------------------------------

    if looks_like_metadata(text):
        score -= 10

    if looks_like_filename(text):
        score -= 10

    # ------------------------------------------
    # Body protection
    # ------------------------------------------

    if len(text) > 180:
        score -= 10

    if looks_like_sentence(text):
        score -= 6

    # Numbered sentences are usually body.
    if looks_like_numbered_body(text):
        score -= 5

        # Short numbered headings such as
        # 'Response 1' are handled above.
        if is_correspondence_heading(text):
            score += 8

    # ------------------------------------------
    # Font / visual signals
    # ------------------------------------------

    if bold:
        score += 3

    if font_size >= median_size * 1.25:
        score += 4

    if font_size >= median_size * 1.45:
        score += 2

    if is_all_caps(text):
        score += 2

    if is_title_case(text):
        score += 2

    # ------------------------------------------
    # Reasonable heading length
    # ------------------------------------------

    words = word_count(text)

    if 1 <= words <= 12:
        score += 1

    if words > 15:
        score -= 4

    return score


def is_likely_heading(
    line: dict,
    all_lines: list,
    inside_table: bool = False,
) -> bool:

    score = heading_score(
        line=line,
        all_lines=all_lines,
        inside_table=inside_table,
    )

    text = normalize_text(
        line.get("text", "")
    )

    if not text:
        return False

    # Strong explicit heading.
    if is_known_heading(text):
        return not inside_table

    if is_correspondence_heading(text):
        return not inside_table

    # Generic visual heading.
    return score >= 6