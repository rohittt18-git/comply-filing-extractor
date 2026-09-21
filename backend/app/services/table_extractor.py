from typing import Dict, List, Tuple

import pymupdf


def boxes_overlap(
    a: Tuple[float, float, float, float],
    b: Tuple[float, float, float, float],
) -> bool:
    ax0, ay0, ax1, ay1 = a
    bx0, by0, bx1, by1 = b

    return not (
        ax1 <= bx0
        or bx1 <= ax0
        or ay1 <= by0
        or by1 <= ay0
    )


def extract_tables(
    pdf_path: str,
) -> Dict[int, List[Dict]]:
    """
    Detect tables page-by-page using PyMuPDF's table detector.

    Failure to detect a table is not fatal.
    The normal text extraction remains the fallback.
    """

    document = pymupdf.open(pdf_path)

    result = {}

    try:

        for page_number, page in enumerate(
            document,
            start=1,
        ):

            tables_for_page = []

            try:
                finder = page.find_tables()

                tables = finder.tables

            except Exception:
                tables = []

            for table_index, table in enumerate(
                tables
            ):

                bbox = tuple(table.bbox)

                try:
                    data = table.extract()
                except Exception:
                    data = []

                if not data:
                    continue

                rows = []

                for row in data:

                    cleaned_row = []

                    for cell in row:

                        if cell is None:
                            cleaned_row.append("")
                        else:
                            cleaned_row.append(
                                str(cell).strip()
                            )

                    if any(cleaned_row):
                        rows.append(cleaned_row)

                if not rows:
                    continue

                tables_for_page.append(
                    {
                        "index": table_index,
                        "bbox": bbox,
                        "rows": rows,
                    }
                )

            result[page_number] = tables_for_page

    finally:
        document.close()

    return result


def table_to_text(table: Dict) -> str:
    """
    Convert a detected table into readable structured text.

    We deliberately keep all cells instead of throwing away
    table information.
    """

    rows = table.get("rows", [])

    output = []

    for row in rows:

        values = [
            str(value).strip()
            for value in row
        ]

        values = [
            value
            for value in values
            if value
        ]

        if values:
            output.append(
                " | ".join(values)
            )

    return "\n".join(output).strip()