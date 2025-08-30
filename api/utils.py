from fastapi import FastAPI, UploadFile
import docx
import pdfplumber

async def extract_text(file: UploadFile) -> str:
    """Extract text from PDF, DOCX, or TXT files."""
    content = await file.read()

    if file.filename.lower().endswith(".pdf"):
        text = ""
        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text

    elif file.filename.lower().endswith(".docx"):
        doc = docx.Document(file.file)
        return "\n".join([p.text for p in doc.paragraphs])

    else:  # default to plain text
        return content.decode("utf-8", errors="ignore")