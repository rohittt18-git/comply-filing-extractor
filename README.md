Comply Filing Extractor
A full-stack PDF extraction platform that identifies document headings, separates headings from their corresponding body content, and presents the extracted information in a structured web interface.


🔗 Live Demo

Frontend
https://comply-filing-extractor.vercel.app/

Backend API
https://comply-filing-extractor-api.onrender.com

API Documentation
https://comply-filing-extractor-api.onrender.com/docs

GitHub Repository
https://github.com/rohittt18-git/comply-filing-extractor



This project was developed as a take-home assignment for Comply.ai.
📌 Project Overview

PDF filings are often difficult to process programmatically because their content is not always organized as simple paragraphs.

A document can contain:
- Headings
- Paragraphs
- Tables
- Metadata
- Repeated headers and footers
- Numbered sections
- Different font sizes and styles
- Multiple pages with different layouts

The goal of this project is to build a PDF extraction pipeline that analyzes these documents and converts their content into structured sections.

For example, a PDF containing:

    GENERAL INFORMATION

    Company and Contact
    Company Name: Example Company
    Address: Example Address

    Filing Description
    This filing contains information about...

can be converted into structured data such as:
json
{
  "heading": "General Information",
  "text": "Company and Contact\nCompany Name: Example Company...\nFiling Description\nThis filing contains information about...",
  "page": 3
}

The extracted information is returned through a FastAPI backend and displayed through a React web application.

🎯 Objective

The main objective of the project is to:

1.Accept a PDF document from the user.
2.Extract text while preserving document layout information.
3.Detect meaningful headings.
4.Separate headings from their associated body content.
5.Preserve important table and document information.
6.Detect and remove repeated page-level headers and footers where appropriate.
7.Convert the extracted information into structured JSON.
8.Provide the result through a REST API.
9.Display the structured information through a web interface.

🏗️ System Architecture
The application follows this processing pipeline:

                   PDF DOCUMENT
                         │
                         ▼
              ┌─────────────────────┐
              │   PyMuPDF Parser    │
              │                     │
              │ Text + Coordinates  │
              │ Font + Size + Bold  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Layout Normalizer   │
              │                     │
              │ Normalize extracted │
              │ page content        │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Table Extraction    │
              │                     │
              │ Detect tables and   │
              │ protect table cells │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Heading Detector    │
              │                     │
              │ Font / Position /   │
              │ Context / Patterns  │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Section Extractor   │
              │                     │
              │ Heading + Body      │
              │ Section grouping    │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Extraction Validator│
              │                     │
              │ Coverage / Quality  │
              │ Checks              │
              └──────────┬──────────┘
                         │
                         ▼
                    FASTAPI API
                         │
                         ▼
              ┌─────────────────────┐
              │    React Frontend   │
              │                     │
              │ Upload → Extract →  │
              │ View Structured Data│
              └─────────────────────┘

🔄 How the Extraction Pipeline Works

1. PDF Upload
The user selects a PDF from the React frontend.
The frontend sends the file to:

POST /api/extract

using multipart form data.

2. PDF Parsing
The backend uses PyMuPDF to read the PDF.
Instead of extracting only plain text, the extractor collects layout information such as:

Text content
Page number
X/Y coordinates
Bounding box
Font size
Font name
Bold information
Line position
This information is useful because heading detection cannot reliably depend only on the text itself


3. Layout Normalization
The extracted PDF content is normalized before heading detection.
The normalization process creates a consistent representation of:

Pages
Blocks
Lines
Text positions
Font information
This provides the later stages with cleaner input.


4. Table Detection
Tables are handled separately because table content can easily be mistaken for headings.
The system checks PDF pages for tables and records their bounding boxes.

Example:
┌───────────────────┬──────────────┬──────────────┐
│ Item              │ Status       │ Date         │
├───────────────────┼──────────────┼──────────────┤
│ Filing Document   │ Approved     │ 01/01/2026   │
│ Response Letter   │ Submitted    │ 02/01/2026   │
└───────────────────┴──────────────┴──────────────┘
Table cells are protected from being incorrectly classified as document headings.
This is especially important for filing documents containing large schedules and metadata tables.


5. Repeated Header and Footer Detection
Many PDFs contain repeated information on every page.
For example:

SERFF Tracking #
State Tracking #
Company Tracking #
State
Filing Company
If these repeated elements were treated as normal document content on every page, the extracted result would contain unnecessary duplication.
The extraction pipeline identifies repeated page-level content using:

Text frequency
Position on the page
Number of pages where the text occurs
Repeated page elements can then be excluded from the section structure.
The approach is dynamic rather than depending on a specific tracking number or a fixed page range.



6. Heading Detection
The heading detector uses multiple signals instead of relying on a single rule.
Text Characteristics
The detector considers:

Number of words
Sentence-like structure
Uppercase text
Title Case text
Numbered text
Metadata-like labels
Known document headings
Layout Characteristics

The detector also considers:

Font size
Font weight
Position
Relative size compared with surrounding document text
Context

The detector also considers the surrounding document structure.



7. Extraction Validation
The backend contains an extraction validation layer that can inspect the generated structure.
Validation can check:

Raw extracted character count
Structured character count
Content preservation ratio
Tiny sections
Suspicious headings
Extraction warnings

This provides a mechanism for identifying potential extraction-quality problems instead of silently accepting incorrect output.
📦 API
Health Check
GET /api/health

Example response:

{
  "status": "healthy"
}



🖥️ Frontend
The frontend is built using React and provides a web interface for the PDF extraction pipeline.
Main Workflow
Login
  ↓
Dashboard
  ↓
Upload PDF
  ↓
Extract Document
  ↓
Backend Processing
  ↓
Structured Sections
  ↓
View / Copy / Download Results



Frontend Features
   User login
   Dashboard
   PDF upload
   Document extraction
   Extraction status
   Page count
   Section count
   Structured heading/body display
   JSON preview
   Copy extracted content
   Download results
   Document history
   Analytics
   Settings
   Responsive interface



🧰 Technology Stack
-> Frontend
React
Vite
JavaScript
Tailwind CSS
Axios
React Router
Lucide React


-> Backend
Python
FastAPI
Uvicorn
PyMuPDF
Pydantic
python-multipart

-> Development & Deployment
Git
GitHub
Render
Vercel



📁 Project Structure
comply-filing-extractor/
│
├── backend/
│   │
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── models/
│   │   │   └── schemas.py
│   │   │
│   │   └── services/
│   │       ├── pdf_extractor.py
│   │       ├── layout_normalizer.py
│   │       ├── table_extractor.py
│   │       ├── heading_detector.py
│   │       ├── section_extractor.py
│   │       └── extraction_validator.py
│   │
│   ├── tests/
│   │   └── test_extraction.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── sample-pdfs/
│   ├── AMGN-135003565.pdf
│   ├── NYLM-134614243.pdf
│   └── UNAM-135051123.pdf
│
├── .gitignore
├── README.md
└── LICENSE



🔗 Frontend → Backend Communication

The frontend communicates with the FastAPI backend using the environment variable:
VITE_API_URL

For local development:
VITE_API_URL=http://localhost:8000

The extraction request is sent to:
${VITE_API_URL}/api/extract

Therefore, locally:
http://localhost:8000/api/extract

For production, VITE_API_URL points to the deployed FastAPI backend.




🚀 Deployment
The application is separated into two independently deployed services.

Backend — Render
The FastAPI backend can be deployed using Render.
Render Configuration
Root Directory:
backend
Build Command:
pip install -r requirements.txt
Start Command:
uvicorn app.main:app --host 0.0.0.0 --port $PORT
After deployment, the backend provides: 
/
/api/health
/docs
/api/extract


Frontend — Vercel
The React frontend can be deployed using Vercel.
Vercel Configuration
Root Directory:
frontend
Production environment variable:

VITE_API_URL = https://comply-filing-extractor-api.onrender.com

For example:
VITE_API_URL= https://comply-filing-extractor-api.onrender.com
The frontend then sends extraction requests to:
https://comply-filing-extractor-api.onrender.com
The backend CORS configuration must allow requests from the deployed Vercel frontend.


🔐 API Design
The backend follows a separation-of-responsibilities approach.

FastAPI
   │
   ├── Request validation
   │
   ├── File validation
   │
   ├── Temporary file handling
   │
   └── Extraction Service
            │
            ├── PDF extraction
            ├── Layout normalization
            ├── Table detection
            ├── Heading detection
            ├── Section construction
            └── Validation



👨‍💻 Author

Rohit Kamati
AI & Data Science Undergraduate

GitHub:
https://github.com/rohittt18-git
