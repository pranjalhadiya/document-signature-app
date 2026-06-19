# Doc Signature App

A full-stack document signing application built with FastAPI (Python), React, PostgreSQL, and Supabase Storage.

## Features

- User Registration & Login
- JWT Authentication
- PDF Upload
- PDF Preview
- Drag & Drop Signature Fields
- Public Document Signing Links
- Generate Signed PDFs
- Audit Logs
- Supabase Storage Integration
- Responsive UI

---

## Tech Stack

### Frontend

- React (Vite)
- React Router
- Axios
- Tailwind CSS
- React PDF
- DnD Kit

### Backend

- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- PyMuPDF (fitz)

### Database

- PostgreSQL

### Storage

- Supabase Storage

---

## Environment Variables

### Backend (.env)

DATABASE_URL=

SECRET_KEY=

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7

SUPABASE_URL=

SUPABASE_KEY=

FRONTEND_URL=

### Frontend (.env)

VITE_API_URL=

---

## Project Structure

```
doc-signature/
│
├── backend/
│   ├── routers/
│   ├── models/
│   ├── schemas/
│   ├── utils/
│   ├── database.py
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── api/
│   └── vite.config.js
│
└── README.md
```

## Installation

### Backend

cd backend

pip install -r requirements.txt

uvicorn main:app --reload

### Frontend

cd frontend

npm install

npm run dev

---

## API Endpoints

### Authentication

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

### Dashboard

GET /api/dashboard

### Documents

POST /api/documents/upload

GET /api/documents

POST /api/documents/{id}/generate

POST /api/documents/{id}/share

GET /api/documents/public/{token}

### Signatures

POST /api/signatures/

GET /api/signatures/document/{document_id}

DELETE /api/signatures/{signature_id}

PUT /api/signatures/{signature_id}/status

### Public Signing

POST /api/public-sign/{token}

### Audit Logs

GET /api/audit/{document_id}

---

### Deployment

- Vercel (Frontend)
- Render (Backend)

---

### Future Improvements

- Multi-user signing workflow
- Email notifications
- Document expiry links
- Role-based access control
