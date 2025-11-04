from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.api.v1.endpoints.simple_auth import get_current_user
from app.schemas.user import ProfileResponse
import aiofiles
import os
import uuid
from pathlib import Path
from typing import Optional
import mimetypes

router = APIRouter()

# Create upload directories
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "course-images").mkdir(exist_ok=True)
(UPLOAD_DIR / "course-videos").mkdir(exist_ok=True)
(UPLOAD_DIR / "course-content").mkdir(exist_ok=True)


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return Path(filename).suffix.lower()


def is_allowed_file_type(filename: str, allowed_types: list) -> bool:
    """Check if file type is allowed."""
    extension = get_file_extension(filename).lstrip('.')
    return extension in allowed_types


async def save_uploaded_file(file: UploadFile, bucket: str) -> str:
    """Save uploaded file and return the file path."""
    # Generate unique filename
    file_extension = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create file path
    file_path = UPLOAD_DIR / bucket / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Return relative path for URL
    return f"/uploads/{bucket}/{unique_filename}"


@router.post("/upload/course-image")
async def upload_course_image(
    file: UploadFile = File(...),
    current_user: ProfileResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload course image."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Check file type
    if not is_allowed_file_type(file.filename, settings.allowed_image_types_list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.allowed_image_types_list)}"
        )
    
    try:
        file_path = await save_uploaded_file(file, "course-images")
        
        return JSONResponse(content={
            "message": "File uploaded successfully",
            "file_path": file_path,
            "filename": file.filename,
            "content_type": file.content_type
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )


@router.post("/upload/course-video")
async def upload_course_video(
    file: UploadFile = File(...),
    current_user: ProfileResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload course video."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Check file type
    if not is_allowed_file_type(file.filename, settings.allowed_video_types_list):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.allowed_video_types_list)}"
        )
    
    try:
        file_path = await save_uploaded_file(file, "course-videos")
        
        return JSONResponse(content={
            "message": "Video uploaded successfully",
            "file_path": file_path,
            "filename": file.filename,
            "content_type": file.content_type
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading video: {str(e)}"
        )


@router.post("/upload/course-content")
async def upload_course_content(
    file: UploadFile = File(...),
    current_user: ProfileResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload course content file."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Check file type
    allowed_types = (
        settings.allowed_document_types_list
        + settings.allowed_image_types_list
        + settings.allowed_audio_types_list
    )
    if not is_allowed_file_type(file.filename, allowed_types):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_types)}"
        )
    
    try:
        file_path = await save_uploaded_file(file, "course-content")
        
        return JSONResponse(content={
            "message": "File uploaded successfully",
            "file_path": file_path,
            "filename": file.filename,
            "content_type": file.content_type
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )


@router.delete("/delete/{bucket}/{filename}")
async def delete_file(
    bucket: str,
    filename: str,
    current_user: ProfileResponse = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete uploaded file."""
    # Validate bucket
    if bucket not in ["course-images", "course-videos", "course-content"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid bucket"
        )
    
    file_path = UPLOAD_DIR / bucket / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    try:
        file_path.unlink()
        return JSONResponse(content={
            "message": "File deleted successfully",
            "filename": filename
        })
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}"
        )
