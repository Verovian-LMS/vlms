from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://username:password@localhost:5432/learnify_med_skillz"
    DATABASE_URL_TEST: str = "postgresql://username:password@localhost:5432/learnify_med_skillz_test"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-jwt-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: str = "100MB"
    ALLOWED_IMAGE_TYPES: str = "jpg,jpeg,png,gif,webp"
    ALLOWED_VIDEO_TYPES: str = "mp4,webm,mov,avi"
    # Explicit audio types for course-content uploads
    ALLOWED_AUDIO_TYPES: str = "mp3,wav,ogg,m4a"
    # Expanded to support audio, presentations, archives, and rich text for course-content uploads
    ALLOWED_DOCUMENT_TYPES: str = (
        "pdf,doc,docx,txt,rtf,md,ppt,pptx,csv,xls,xlsx,zip,rar,7z,mp3,wav,ogg,m4a"
    )
    
    # AWS S3 (Optional)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_BUCKET_NAME: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    USE_S3: bool = False
    
    # CORS
    # Include 5174 to support alternate Vite dev server port
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
    
    # App
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    @property
    def allowed_image_types_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_IMAGE_TYPES.split(",")]
    
    @property
    def allowed_video_types_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_VIDEO_TYPES.split(",")]
    
    @property
    def allowed_audio_types_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_AUDIO_TYPES.split(",")]
    
    @property
    def allowed_document_types_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_DOCUMENT_TYPES.split(",")]
    
    class Config:
        env_file = "env"


settings = Settings()
