from fastapi import APIRouter, Depends, HTTPException, status
from app.api.v1.endpoints.simple_auth import get_current_user
from app.schemas.user import ProfileResponse
from app.core.config import settings
import os
from pathlib import Path

router = APIRouter()

# Check if upload directories exist
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
COURSE_IMAGES_DIR = UPLOAD_DIR / "course-images"
COURSE_VIDEOS_DIR = UPLOAD_DIR / "course-videos"

@router.get("/status")
async def check_storage_status(current_user: ProfileResponse = Depends(get_current_user)):
    """
    Check if storage is available and properly configured
    """
    try:
        # Ensure directories exist
        UPLOAD_DIR.mkdir(exist_ok=True)
        COURSE_IMAGES_DIR.mkdir(exist_ok=True)
        COURSE_VIDEOS_DIR.mkdir(exist_ok=True)
        
        # Check if directories are writable
        test_file_path = COURSE_IMAGES_DIR / ".test_write_access"
        with open(test_file_path, "w") as f:
            f.write("test")
        os.remove(test_file_path)
        
        return {
            "status": "available",
            "message": "Storage is available and properly configured",
            "buckets": {
                "course-images": {"status": "available"},
                "course-videos": {"status": "available"}
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Storage is not properly configured: {str(e)}"
        )