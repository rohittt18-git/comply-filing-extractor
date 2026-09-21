from typing import List

from pydantic import BaseModel


class Section(BaseModel):
    id: int
    heading: str
    text: str
    page: int


class ExtractionResult(BaseModel):
    filename: str
    pages: int
    sections: List[Section]