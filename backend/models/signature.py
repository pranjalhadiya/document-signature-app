from sqlalchemy import Column, Integer, String, ForeignKey
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

    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)

    page = Column(Integer, nullable=False)

    status = Column(
        String(50),
        default="pending"
    )