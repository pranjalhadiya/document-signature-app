from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from database import Base


class SigningLink(Base):
    __tablename__ = "signing_links"

    id = Column(Integer, primary_key=True, index=True)

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False
    )

    token = Column(
        String(255),
        unique=True,
        nullable=False
    )

    email = Column(
        String(255),
        nullable=True
    )

    status = Column(
        String(50),
        default="pending"
    )