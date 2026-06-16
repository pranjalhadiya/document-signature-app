from pydantic import BaseModel
from datetime import datetime


class AuditLogResponse(BaseModel):
    id: int
    document_id: int
    action: str
    user: str
    ip_address: str
    created_at: datetime

    class Config:
        from_attributes = True