from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    Text
)
from database import Base


class Signature(Base):
    __tablename__ = "signatures"

    id = Column(Integer, primary_key=True, index=True)

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)

    page = Column(Integer, nullable=False)

    # NEW
    value = Column(Text, nullable=False)

    # NEW
    style = Column(String(50), nullable=True)

    status = Column(
        String(50),
        default="pending"
    )
    rejection_reason = Column(String, nullable=True)