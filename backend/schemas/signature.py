from pydantic import BaseModel

class SignatureCreate(BaseModel):
    document_id: int
    x: int
    y: int
    page: int