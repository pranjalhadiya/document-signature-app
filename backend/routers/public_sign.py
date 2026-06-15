from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from database import get_db
from models.signing_link import SigningLink
from models.signature import Signature
from schemas.public_sign import PublicSignatureCreate

router = APIRouter(
    prefix="/api/public-sign",
    tags=["Public Signing"]
)

@router.post("/{token}")
def save_public_signature(
    token: str,
    data: PublicSignatureCreate,
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
            detail="Invalid token"
        )

    signature = Signature(
        document_id=link.document_id,
        user_id=1,
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
        "message": "Saved",
        "id": signature.id
    }