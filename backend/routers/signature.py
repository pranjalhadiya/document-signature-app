from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models.signature import Signature
from models.user import User

from schemas.signature import SignatureCreate
from utils.dependencies import get_current_user

router = APIRouter(
    prefix="/api/signatures",
    tags=["Signatures"]
)


# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def save_signature(
    data: SignatureCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Save signature position for the current user
    signature = Signature(
        document_id=data.document_id,
        user_id=current_user.id,
        x=data.x,
        y=data.y,
        page=data.page,
        value=data.value,
        style=data.style,
        status="pending"
    )

    db.add(signature)
    db.commit()
    db.refresh(signature)

    return {
        "message": "Signature position saved",
        "id": signature.id
    }

@router.get("/document/{document_id}")
def get_signatures(
    document_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(Signature)
        .filter(
            Signature.document_id == document_id
        )
        .all()
    )

@router.delete("/{signature_id}")
def delete_signature(
    signature_id: int,
    db: Session = Depends(get_db)
):
    signature = (
        db.query(Signature)
        .filter(Signature.id == signature_id)
        .first()
    )

    if not signature:
        raise HTTPException(
            status_code=404,
            detail="Signature not found"
        )

    db.delete(signature)
    db.commit()

    return {"message": "Deleted"}