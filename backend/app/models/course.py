from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.types import UUID
import uuid
import enum
from app.core.database import Base


class CourseStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVE = "archive"


class CompletionStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class ContentType(str, enum.Enum):
    VIDEO = "video"
    PDF = "pdf"
    SLIDES = "slides"
    AUDIO = "audio"
    DOCUMENT = "document"
    INTERACTIVE = "interactive"
    DOWNLOADABLE = "downloadable"
    TEXT = "text"
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"
    FILE = "file"


class Course(Base):
    __tablename__ = "courses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    long_description = Column(Text, nullable=True)
    status = Column(String, nullable=True)  # Using string for flexibility
    image_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    level = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    author = relationship("Profile", back_populates="courses")
    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course")
    discussions = relationship("Discussion", back_populates="course")


class Module(Base):
    __tablename__ = "modules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    sequence_order = Column(Integer, nullable=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    content_type = Column(String, nullable=True)  # Using string for flexibility
    
    # Content URLs and files
    video_url = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    slides_url = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)
    interactive_url = Column(String, nullable=True)
    document_url = Column(Text, nullable=True)
    # Column is named 'download_url' in DB, expose as 'downloadable_url' in ORM
    downloadable_url = Column('download_url', String, nullable=True)
    
    # Content metadata
    content = Column(Text, nullable=True)  # For document/text content
    transcript = Column(Text, nullable=True)  # For video/audio transcripts
    notes = Column(Text, nullable=True)
    
    # Content properties
    duration = Column(Integer, nullable=True)  # Duration in minutes
    page_count = Column(Integer, nullable=True)  # For PDF documents
    slide_count = Column(Integer, nullable=True)  # For presentations
    reading_time = Column(Integer, nullable=True)  # For text content in minutes
    file_size = Column(String, nullable=True)  # For downloadable files
    file_type = Column(String, nullable=True)  # File extension/type
    completion_criteria = Column(Text, nullable=True)  # For interactive content
    
    # Lesson settings
    sequence_order = Column(Integer, nullable=True)
    is_preview = Column(Boolean, default=False)
    
    # Relationships
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    module = relationship("Module", back_populates="lessons")
    lesson_progress = relationship("LessonProgress", back_populates="lesson")
    quizzes = relationship("Quiz", back_populates="lesson")
    assignments = relationship("Assignment", back_populates="lesson")
    discussions = relationship("Discussion", back_populates="lesson")


class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    enrollment_date = Column(DateTime(timezone=True), server_default=func.now())
    completion_date = Column(DateTime(timezone=True), nullable=True)
    progress = Column(Float, default=0.0)
    completion_status = Column(String, nullable=True)
    last_accessed = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("Profile", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False)
    progress = Column(Float, default=0.0)
    is_completed = Column(Boolean, default=False)
    last_watched_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("Profile")
    lesson = relationship("Lesson", back_populates="lesson_progress")


class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=True)
    progress_percentage = Column(Float, default=0.0)
    completion_status = Column(String, nullable=True)
    last_accessed = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("Profile")
    course = relationship("Course")
    lesson = relationship("Lesson")


# Legacy aliases for backward compatibility
Lecture = Lesson
LectureProgress = LessonProgress








