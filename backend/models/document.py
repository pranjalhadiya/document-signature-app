from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Document(Base):

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_url = Column(String)
    signed_file_url = Column(String, nullable=True)

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

   