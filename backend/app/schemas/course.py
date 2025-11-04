from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    long_description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    image_url: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    long_description: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None


class CourseResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    long_description: Optional[str]
    status: Optional[str]
    image_url: Optional[str]
    category: Optional[str]
    level: Optional[str]
    is_featured: bool
    author_id: Optional[UUID]
    created_at: datetime
    updated_at: Optional[datetime]
    # Derived counts
    module_count: Optional[int] = 0
    lesson_count: Optional[int] = 0
    
    class Config:
        from_attributes = True


class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    sequence_order: Optional[int] = None


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sequence_order: Optional[int] = None


class ModuleResponse(BaseModel):
    id: UUID
    title: Optional[str]
    description: Optional[str]
    sequence_order: Optional[int]
    course_id: Optional[UUID]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Lesson schemas (renamed from Lecture)
class LessonCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: Optional[str] = None
    # Content URLs for different types
    video_url: Optional[str] = None
    pdf_url: Optional[str] = None
    slides_url: Optional[str] = None
    audio_url: Optional[str] = None
    document_url: Optional[str] = None
    interactive_url: Optional[str] = None
    downloadable_url: Optional[str] = None
    # Content metadata
    content: Optional[str] = None  # Text content or HTML
    transcript: Optional[str] = None
    # Content properties
    duration: Optional[int] = None  # Duration in minutes
    page_count: Optional[int] = None  # For PDFs/documents
    slide_count: Optional[int] = None  # For presentations
    reading_time: Optional[int] = None  # Estimated reading time in minutes
    file_size: Optional[int] = None  # File size in bytes
    file_type: Optional[str] = None  # MIME type
    # Lesson properties
    sequence_order: Optional[int] = None
    is_preview: bool = False
    notes: Optional[str] = None
    # Completion criteria
    completion_criteria: Optional[str] = None  # JSON string with criteria


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content_type: Optional[str] = None
    # Content URLs for different types
    video_url: Optional[str] = None
    pdf_url: Optional[str] = None
    slides_url: Optional[str] = None
    audio_url: Optional[str] = None
    document_url: Optional[str] = None
    interactive_url: Optional[str] = None
    downloadable_url: Optional[str] = None
    # Content metadata
    content: Optional[str] = None
    transcript: Optional[str] = None
    # Content properties
    duration: Optional[int] = None
    page_count: Optional[int] = None
    slide_count: Optional[int] = None
    reading_time: Optional[int] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    # Lesson properties
    sequence_order: Optional[int] = None
    is_preview: Optional[bool] = None
    notes: Optional[str] = None
    completion_criteria: Optional[str] = None


class LessonResponse(BaseModel):
    id: UUID
    title: Optional[str]
    description: Optional[str]
    content_type: Optional[str]
    # Content URLs for different types
    video_url: Optional[str]
    pdf_url: Optional[str]
    slides_url: Optional[str]
    audio_url: Optional[str]
    document_url: Optional[str]
    interactive_url: Optional[str]
    downloadable_url: Optional[str]
    # Content metadata
    content: Optional[str]
    transcript: Optional[str]
    # Content properties
    duration: Optional[int]
    page_count: Optional[int]
    slide_count: Optional[int]
    reading_time: Optional[int]
    file_size: Optional[int]
    file_type: Optional[str]
    # Lesson properties
    sequence_order: Optional[int]
    is_preview: bool
    notes: Optional[str]
    completion_criteria: Optional[str]
    module_id: Optional[UUID]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True




class EnrollmentCreate(BaseModel):
    course_id: UUID


class EnrollmentResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    course_id: Optional[UUID]
    enrollment_date: datetime
    completion_date: Optional[datetime]
    progress: float
    completion_status: Optional[str]
    last_accessed: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Lesson Progress schemas (renamed from Lecture Progress)
class LessonProgressCreate(BaseModel):
    lesson_id: UUID
    progress: float = 0.0
    is_completed: bool = False


class LessonProgressResponse(BaseModel):
    id: UUID
    user_id: UUID
    lesson_id: UUID
    progress: float
    is_completed: bool
    last_watched_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Legacy Lecture schemas removed for full consistency







# Recent activity schema for profile overview
class UserActivityResponse(BaseModel):
    id: UUID
    type: str
    name: str
    created_at: datetime
    details: Optional[str] = None








