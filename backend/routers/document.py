import os
import shutil
import fitz
import secrets

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException,
    Request
)

from sqlalchemy.orm import Session

from database import SessionLocal
from models.document import Document
from models.user import User
from models.signature import Signature
from models.signing_link import SigningLink
from utils.dependencies import get_current_user
from utils.audit import create_audit_log

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
    request: Request,
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

    create_audit_log(
        db,
        document.id,
        "Uploaded document",
        current_user.name,
        request.client.host
    )

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
    request: Request,
    current_user: User = Depends(get_current_user),
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

    create_audit_log(
        db,
        document.id,
        "Generated signed PDF",
        current_user.name,
        request.client.host
    )

    return {
        "message": "PDF generated",
        "file": output_path
    }

@router.post("/{document_id}/share")
def generate_sign_link(
    document_id: int,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    token = secrets.token_urlsafe(32)

    link = SigningLink(
        document_id=document_id,
        token=token
    )

    db.add(link)
    db.commit()
    db.refresh(link)

    create_audit_log(
        db,
        document_id,
        "Generated public signing link",
        current_user.name,
        request.client.host
    )

    return {
        "token": token,
        "link": f"http://localhost:5173/sign/{token}"
    }

@router.get("/public/{token}")
def get_document_by_token(
    token: str,
    db: Session = Depends(get_db)
):
    link = (
        db.query(SigningLink)
        .filter(SigningLink.token == token)
        .first()
    )

    if not link:
        raise HTTPException(
            status_code=404,
            detail="Invalid link"
        )

    document = (
        db.query(Document)
        .filter(Document.id == link.document_id)
        .first()
    )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "file_url": f"http://127.0.0.1:8000/uploads/{document.filename}"
    }