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