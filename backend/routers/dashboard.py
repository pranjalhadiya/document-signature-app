from fastapi import APIRouter, Depends
from models.user import User
from utils.dependencies import get_current_user

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)

@router.get("/")
def dashboard(
    current_user: User = Depends(get_current_user)
):
    return {
        "message": f"Welcome {current_user.name}",
        "email": current_user.email
    }