from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.audit_log import AuditLog

router = APIRouter(
    prefix="/api/audit",
    tags=["Audit Logs"]
)


@router.get("/{document_id}")
def get_logs(
    document_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(AuditLog)
        .filter(
            AuditLog.document_id == document_id
        )
        .order_by(
            AuditLog.created_at.desc()
        )
        .all()
    )