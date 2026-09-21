from typing import Dict, List


def normalize(value: str) -> str:
    return " ".join(
        (value or "").split()
    ).lower()


def validate_extraction(
    raw_lines: List[Dict],
    sections: List[Dict],
    page_count: int,
) -> Dict:

    raw_text = " ".join(
        item.get("text", "")
        for item in raw_lines
    )

    structured_text = " ".join(
        section.get("text", "")
        for section in sections
    )

    raw_length = len(raw_text.strip())
    structured_length = len(
        structured_text.strip()
    )

    if raw_length:
        preservation_ratio = (
            structured_length
            / raw_length
        )
    else:
        preservation_ratio = 1.0

    pages_found = sorted(
        {
            item.get("page")
            for item in raw_lines
            if item.get("page")
        }
    )

    section_lengths = [
        len(
            section.get("text", "")
        )
        for section in sections
    ]

    tiny_sections = sum(
        1
        for length in section_lengths
        if length < 25
    )

    suspicious_headings = []

    for section in sections:

        heading = (
            section.get("heading")
            or ""
        )

        normalized = normalize(
            heading
        )

        if len(normalized) <= 2:
            suspicious_headings.append(
                heading
            )

        if normalized.replace(
            " ",
            "",
        ).isdigit():
            suspicious_headings.append(
                heading
            )

    warnings = []

    if len(pages_found) < page_count:
        warnings.append(
            "Some pages did not produce text lines."
        )

    if preservation_ratio < 0.60:
        warnings.append(
            "A large amount of extracted text may not "
            "have been assigned to sections."
        )

    if tiny_sections > max(
        5,
        len(sections) // 3,
    ):
        warnings.append(
            "Many sections contain very little text; "
            "heading detection may be too aggressive."
        )

    if suspicious_headings:
        warnings.append(
            "Some headings may require review."
        )

    return {
        "page_count": page_count,
        "pages_with_text": len(
            pages_found
        ),
        "sections": len(sections),
        "raw_characters": raw_length,
        "structured_characters": structured_length,
        "preservation_ratio": round(
            preservation_ratio,
            3,
        ),
        "warnings": warnings,
        "valid": (
            len(warnings) == 0
        ),
    }