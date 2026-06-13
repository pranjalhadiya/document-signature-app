from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey
)
from database import Base


class Signature(Base):
    __tablename__ = "signatures"

    id = Column(Integer, primary_key=True, index=True)

    # Associated document and signer
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

    # Signature position on the PDF (stored as percentages)
    x = Column(Float, nullable=False)
    y = Column(Float, nullable=False)

    page = Column(Integer, nullable=False)

    # Current signing status
    status = Column(
        String(50),
        default="pending"
    )