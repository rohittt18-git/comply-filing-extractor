import re
from typing import Dict, List, Tuple

from .pdf_extractor import extract_document_layout
from .heading_detector import (
    is_likely_heading,
    normalize_text,
)
from .table_extractor import (
    boxes_overlap,
    extract_tables,
    table_to_text,
)


def clean_body(text: str) -> str:
    if not text:
        return ""

    lines = []

    for line in text.split("\n"):

        line = re.sub(
            r"[ \t]+",
            " ",
            line,
        ).strip()

        if line:
            lines.append(line)

    return "\n".join(lines).strip()


def get_table_boxes(
    tables: Dict[int, List[Dict]],
    page_number: int,
) -> List[Tuple]:

    return [
        tuple(table["bbox"])
        for table in tables.get(
            page_number,
            [],
        )
    ]


def line_inside_table(
    line: Dict,
    table_boxes: List[Tuple],
) -> bool:

    line_box = (
        line["x0"],
        line["y0"],
        line["x1"],
        line["y1"],
    )

    return any(
        boxes_overlap(
            line_box,
            table_box,
        )
        for table_box in table_boxes
    )


def build_table_items(
    tables: Dict[int, List[Dict]],
) -> Dict[int, List[Dict]]:

    result = {}

    for page_number, page_tables in tables.items():

        items = []

        for table in page_tables:

            text = table_to_text(
                table
            )

            if not text:
                continue

            bbox = table["bbox"]

            items.append(
                {
                    "page": page_number,
                    "text": text,
                    "x0": bbox[0],
                    "y0": bbox[1],
                    "x1": bbox[2],
                    "y1": bbox[3],
                    "is_table": True,
                    "font_size": 0,
                    "is_bold": False,
                }
            )

        result[page_number] = items

    return result


def detect_repeated_headers(
    pages: List[Dict],
) -> set:

    """
    Detect repeated page-header/footer lines.

    We use frequency + position, not company-specific
    tracking numbers.
    """

    occurrences = {}

    page_count = len(pages)

    if page_count < 4:
        return set()

    for page in pages:

        for line in page["lines"]:

            text = normalize_text(
                line["text"]
            ).lower()

            if not text:
                continue

            y_ratio = (
                line["y0"]
                / max(
                    page["height"],
                    1,
                )
            )

            region = (
                "top"
                if y_ratio < 0.15
                else "bottom"
                if y_ratio > 0.85
                else "middle"
            )

            key = (
                text,
                region,
            )

            occurrences.setdefault(
                key,
                set(),
            ).add(
                page["page"]
            )

    repeated = set()

    threshold = max(
        4,
        int(page_count * 0.55),
    )

    for (
        text,
        region,
    ), page_numbers in occurrences.items():

        if (
            len(page_numbers)
            >= threshold
            and region in {"top", "bottom"}
        ):
            repeated.add(text)

    return repeated


def append_text(
    current: Dict,
    text: str,
):
    text = text.strip()

    if not text:
        return

    if current["text"]:
        current["text"] += "\n" + text
    else:
        current["text"] = text


def merge_adjacent_duplicate_sections(
    sections: List[Dict],
) -> List[Dict]:

    if not sections:
        return []

    merged = [
        sections[0].copy()
    ]

    for section in sections[1:]:

        previous = merged[-1]

        same_heading = (
            normalize_text(
                previous["heading"]
            ).lower()
            == normalize_text(
                section["heading"]
            ).lower()
        )

        nearby_pages = (
            section["page"]
            - previous["page"]
            <= 1
        )

        if same_heading and nearby_pages:

            previous["text"] = (
                previous["text"]
                + "\n"
                + section["text"]
            ).strip()

        else:
            merged.append(
                section.copy()
            )

    return merged


def extract_sections(
    pdf_path: str,
) -> List[Dict]:

    layout = extract_document_layout(
        pdf_path
    )

    pages = layout["pages"]

    if not pages:
        return []

    # ------------------------------------------
    # Detect tables.
    # ------------------------------------------

    tables = extract_tables(
        pdf_path
    )

    table_items = build_table_items(
        tables
    )

    # ------------------------------------------
    # Detect repeated page headers/footers.
    # ------------------------------------------

    repeated_headers = detect_repeated_headers(
        pages
    )

    # ------------------------------------------
    # Flatten lines in page order.
    # ------------------------------------------

    all_lines = []

    for page in pages:
        all_lines.extend(
            page["lines"]
        )

    sections = []

    current = None

    for page in pages:

        page_number = page["page"]

        table_boxes = get_table_boxes(
            tables,
            page_number,
        )

        # Combine normal text lines and
        # detected tables.
        page_items = []

        used_table_boxes = []

        for line in page["lines"]:

            text = normalize_text(
                line["text"]
            )

            if not text:
                continue

            normalized = text.lower()

            # --------------------------------------
            # Ignore only repeated top/bottom
            # page furniture.
            # --------------------------------------

            y_ratio = (
                line["y0"]
                / max(
                    page["height"],
                    1,
                )
            )

            is_page_furniture = (
                normalized in repeated_headers
                and (
                    y_ratio < 0.15
                    or y_ratio > 0.85
                )
            )

            if is_page_furniture:
                continue

            # --------------------------------------
            # Table cells should not independently
            # become headings.
            # --------------------------------------

            if line_inside_table(
                line,
                table_boxes,
            ):
                continue

            page_items.append(
                {
                    **line,
                    "is_table": False,
                }
            )

        # Add detected tables.
        for table_item in table_items.get(
            page_number,
            [],
        ):

            page_items.append(
                table_item
            )

        # --------------------------------------
        # Sort by vertical then horizontal
        # position.
        # --------------------------------------

        page_items.sort(
            key=lambda item: (
                item["y0"],
                item["x0"],
            )
        )

        # --------------------------------------
        # Process page.
        # --------------------------------------

        for item in page_items:

            text = item["text"].strip()

            if not text:
                continue

            # A detected table is always body content.
            if item.get("is_table"):
                if current is None:
                    current = {
                        "heading": "Document Content",
                        "text": "",
                        "page": page_number,
                    }

                append_text(
                    current,
                    text,
                )

                continue

            # ----------------------------------
            # Heading detection
            # ----------------------------------

            heading = is_likely_heading(
                line=item,
                all_lines=all_lines,
                inside_table=False,
            )

            if heading:

                if current is not None:

                    body = clean_body(
                        current["text"]
                    )

                    if body:

                        current["text"] = body

                        sections.append(
                            current
                        )

                current = {
                    "heading": text,
                    "text": "",
                    "page": page_number,
                }

                continue

            # ----------------------------------
            # Normal body text.
            # ----------------------------------

            if current is None:

                current = {
                    "heading": "Document Content",
                    "text": "",
                    "page": page_number,
                }

            append_text(
                current,
                text,
            )

    # ------------------------------------------
    # Final section.
    # ------------------------------------------

    if current is not None:

        body = clean_body(
            current["text"]
        )

        if body:

            current["text"] = body

            sections.append(
                current
            )

    # ------------------------------------------
    # Merge repeated continuation headings.
    # ------------------------------------------

    sections = (
        merge_adjacent_duplicate_sections(
            sections
        )
    )

    # ------------------------------------------
    # Remove empty sections.
    # ------------------------------------------

    cleaned = []

    for section in sections:

        heading = normalize_text(
            section["heading"]
        )

        text = clean_body(
            section["text"]
        )

        if not heading:
            continue

        if not text:
            continue

        cleaned.append(
            {
                "heading": heading,
                "text": text,
                "page": section["page"],
            }
        )

    # ------------------------------------------
    # Stable IDs.
    # ------------------------------------------

    result = []

    for index, section in enumerate(
        cleaned,
        start=1,
    ):

        result.append(
            {
                "id": index,
                "heading": section["heading"],
                "text": section["text"],
                "page": section["page"],
            }
        )

    return result