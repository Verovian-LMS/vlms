from fastapi import APIRouter
from app.api.v1.endpoints import auth, files, courses, users, storage, messages

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(files.router, prefix="/files", tags=["file-upload"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(storage.router, prefix="/storage", tags=["storage"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
