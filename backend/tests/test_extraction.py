from pathlib import Path

from app.services.section_extractor import extract_sections


def test_amgn_extraction():

    pdf_path = Path(
        "sample-pdfs/AMGN-135003565.pdf"
    )

    if not pdf_path.exists():
        return

    sections = extract_sections(
        str(pdf_path)
    )

    assert sections

    headings = [
        section["heading"].lower()
        for section in sections
    ]

    assert any(
        "filing at a glance" in heading
        for heading in headings
    )

    assert any(
        "objection letter" in heading
        for heading in headings
    )

    assert any(
        "response letter" in heading
        for heading in headings
    )