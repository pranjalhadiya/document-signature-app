from pydantic import BaseModel


class SignatureCreate(BaseModel):
    document_id: int
    x: float
    y: float
    page: int

    value: str
    style: str | None = None