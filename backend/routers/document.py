import os
import shutil
import fitz
import secrets
import requests

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
from utils.supabase_client import supabase

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

    content = file.file.read()

    supabase.storage.from_("documents").upload(
        file.filename,
        content
    )

    file_url = supabase.storage.from_(
        "documents"
    ).get_public_url(file.filename)

    document = Document(
        filename=file.filename,
        file_url=file_url,
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

    response = requests.get(document.file_url)

    pdf = fitz.open(
        stream=response.content,
        filetype="pdf"
    )

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
    with open(output_path, "rb") as f:
        supabase.storage.from_("signed-pdfs").upload(
            f"signed_{document.filename}",
            f.read()
        )
    pdf.close()

    create_audit_log(
        db,
        document.id,
        "Generated signed PDF",
        current_user.name,
        request.client.host
    )

    signed_url = supabase.storage.from_(
        "signed-pdfs"
    ).get_public_url(
        f"signed_{document.filename}"
    )

    return {
        "message": "PDF generated",
        "file_url": signed_url
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
        "link": f"{os.getenv('FRONTEND_URL')}/sign/{token}"
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
        "file_url": document.file_url
    }