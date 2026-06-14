import os
import shutil
import fitz

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import SessionLocal
from models.document import Document
from models.user import User
from models.signature import Signature
from utils.dependencies import get_current_user

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


UPLOAD_DIR = "uploads"


@router.post("/upload")
def upload_pdf(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Allow only PDF uploads
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files allowed"
        )

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    # Save uploaded file to local storage
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    document = Document(
        filename=file.filename,
        filepath=file_path,
        owner_id=current_user.id
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "File uploaded",
        "id": document.id
    }


@router.get("/")
def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Return documents uploaded by the current user
    documents = (
        db.query(Document)
        .filter(Document.owner_id == current_user.id)
        .all()
    )

    return documents

@router.post("/{document_id}/generate")
def generate_signed_pdf(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    signatures = (
        db.query(Signature)
        .filter(
            Signature.document_id == document_id
        )
        .all()
    )

    if not signatures:
        raise HTTPException(
            status_code=400,
            detail="No fields found"
        )

    pdf = fitz.open(document.filepath)

    for sig in signatures:

        page = pdf[sig.page - 1]

        page_width = page.rect.width

        safe_x = min(
           sig.x,
           page_width - 150
        )

        pdf_x = sig.x * page.rect.width
        pdf_y = sig.y * page.rect.height

        page.insert_text(
            (pdf_x, pdf_y),
            sig.value,
            fontsize=16,
            color=(0, 0, 0)
        )

    output_path = (
        f"signed_pdfs/signed_{document.filename}"
    )

    pdf.save(output_path)
    pdf.close()

    return {
        "message": "PDF generated",
        "file": output_path
    }