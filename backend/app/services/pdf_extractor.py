import re
from typing import Dict, List

import pymupdf


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace("\u00a0", " ")
    text = text.replace("\r", "\n")

    lines = []

    for line in text.split("\n"):
        line = re.sub(r"[ \t]+", " ", line).strip()

        if line:
            lines.append(line)

    return "\n".join(lines).strip()


def extract_document_layout(pdf_path: str) -> Dict:
    """
    Extract the PDF while preserving layout information.

    We keep:
    - page number
    - text
    - coordinates
    - font size
    - font name
    - bold information
    - block/line ordering

    This allows the heading detector to use visual structure
    instead of relying only on text.
    """

    document = pymupdf.open(pdf_path)

    pages = []

    try:
        for page_number, page in enumerate(document, start=1):

            page_width = page.rect.width
            page_height = page.rect.height

            blocks = page.get_text("dict").get("blocks", [])

            lines = []

            for block_index, block in enumerate(blocks):

                if block.get("type") != 0:
                    continue

                for line_index, line in enumerate(
                    block.get("lines", [])
                ):

                    spans = line.get("spans", [])

                    if not spans:
                        continue

                    text_parts = []

                    font_sizes = []
                    fonts = []

                    bold_spans = 0

                    for span in spans:

                        span_text = span.get("text", "")

                        if span_text:
                            text_parts.append(span_text)

                        size = span.get("size")

                        if isinstance(size, (int, float)):
                            font_sizes.append(float(size))

                        font = span.get("font")

                        if font:
                            fonts.append(font)

                        flags = span.get("flags", 0)

                        # PyMuPDF commonly uses bit 4 for bold.
                        # We also check font name below.
                        if flags & 16:
                            bold_spans += 1

                    text = clean_text(
                        "".join(text_parts)
                    )

                    if not text:
                        continue

                    bbox = line.get("bbox", [0, 0, 0, 0])

                    average_font_size = (
                        sum(font_sizes) / len(font_sizes)
                        if font_sizes
                        else 0
                    )

                    font_name = (
                        max(
                            set(fonts),
                            key=fonts.count,
                        )
                        if fonts
                        else ""
                    )

                    font_lower = font_name.lower()

                    is_bold = (
                        bold_spans > 0
                        or "bold" in font_lower
                        or "black" in font_lower
                        or "heavy" in font_lower
                    )

                    lines.append(
                        {
                            "page": page_number,
                            "block_index": block_index,
                            "line_index": line_index,
                            "text": text,
                            "x0": float(bbox[0]),
                            "y0": float(bbox[1]),
                            "x1": float(bbox[2]),
                            "y1": float(bbox[3]),
                            "width": float(bbox[2] - bbox[0]),
                            "height": float(bbox[3] - bbox[1]),
                            "font_size": average_font_size,
                            "font": font_name,
                            "is_bold": is_bold,
                        }
                    )

            lines.sort(
                key=lambda item: (
                    item["y0"],
                    item["x0"],
                )
            )

            pages.append(
                {
                    "page": page_number,
                    "width": page_width,
                    "height": page_height,
                    "lines": lines,
                }
            )

    finally:
        document.close()

    return {
        "pages": pages,
        "page_count": len(pages),
    }


def extract_raw_text(pdf_path: str) -> str:
    """
    Backward-compatible raw text extractor.
    """

    document = pymupdf.open(pdf_path)

    pages = []

    try:
        for page in document:
            text = page.get_text("text")
            pages.append(text)

    finally:
        document.close()

    return "\n".join(pages)