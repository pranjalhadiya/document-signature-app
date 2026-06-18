import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers.auth import router as auth_router
from routers.dashboard import router as dashboard_router
from routers.document import router as document_router
from routers.signature import router as signature_router
from routers.public_sign import router as public_sign_router
from routers.audit_log import (
    router as audit_router
)

app = FastAPI()

# Allow frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://document-signature-app-liart.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


os.makedirs("uploads", exist_ok=True)
os.makedirs("signed_pdfs", exist_ok=True)

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(document_router)
app.include_router(signature_router)
app.include_router(public_sign_router)
app.include_router(audit_router)

# Serve uploaded PDF files
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.mount(
    "/signed_pdfs",
    StaticFiles(directory="signed_pdfs"),
    name="signed_pdfs"
)

@app.get("/")
def home():
    return {"message": "Document Signature API"}