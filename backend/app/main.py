import os
import tempfile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import ExtractionResult
from app.services.section_extractor import extract_sections


app = FastAPI(
    title="Comply Extract API",
    description="Layout-aware PDF document extraction API",
    version="2.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://comply-filing-extractor.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Comply Filing Extraction API",
        "endpoint": "POST /api/extract",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "extraction-api",
    }


@app.post(
    "/api/extract",
    response_model=ExtractionResult,
)
async def extract_pdf(
    file: UploadFile = File(...)
):

    # --------------------------------------
    # Validate file
    # --------------------------------------

    filename = file.filename or "document.pdf"

    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded PDF is empty.",
        )

    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="PDF exceeds the 50 MB upload limit.",
        )

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf",
        ) as temp_file:

            temp_file.write(contents)
            temp_path = temp_file.name

        sections = extract_sections(
            temp_path
        )

        # Get page count from PyMuPDF
        import pymupdf

        document = pymupdf.open(
            temp_path
        )

        page_count = len(document)

        document.close()

        if not sections:

            raise HTTPException(
                status_code=422,
                detail=(
                    "The PDF was readable, but no "
                    "structured content could be extracted."
                ),
            )

        return ExtractionResult(
            filename=filename,
            pages=page_count,
            sections=sections,
        )

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Extraction failed: {str(exc)}",
        )

    finally:

        if temp_path and os.path.exists(
            temp_path
        ):
            os.remove(temp_path)