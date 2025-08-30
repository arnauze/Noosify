from fastapi import FastAPI, UploadFile
import docx
import pdfplumber

async def extract_text(file: UploadFile) -> str:
    """
    Extract plain text content from an uploaded file.

    Supported formats:
    - **PDF (.pdf)**: Uses `pdfplumber` to read and extract text from each page.
    - **DOCX (.docx)**: Uses `python-docx` to extract text from all paragraphs.
    - **TXT (.txt)**: Decodes the raw file bytes as UTF-8 text.
    
    Args:
        file (UploadFile): The uploaded file object (FastAPI `UploadFile`).

    Returns:
        str: The extracted text content from the file.

    Raises:
        Exception: If the file extension is not one of the supported types 
                   (`.pdf`, `.docx`, `.txt`).
    """
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

    elif file.filename.lower().endswith(".txt"):
        return content.decode("utf-8", errors="ignore")

    else:
        raise Exception("File type is not allowed")