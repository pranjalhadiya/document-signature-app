import os
import shutil

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