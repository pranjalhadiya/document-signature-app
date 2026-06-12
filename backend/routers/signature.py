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
    signature = Signature(
        document_id=data.document_id,
        user_id=current_user.id,
        x=data.x,
        y=data.y,
        page=data.page,
        status="pending"
    )

    db.add(signature)
    db.commit()
    db.refresh(signature)

    return {
        "message": "Signature position saved",
        "id": signature.id
    }