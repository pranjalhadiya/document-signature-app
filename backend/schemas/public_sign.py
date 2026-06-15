from pydantic import BaseModel

class PublicSignatureCreate(BaseModel):
    x: float
    y: float
    page: int
    value: str
    style: str | None = None