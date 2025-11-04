from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, ForeignKey, Float
from app.core.types import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    max_points = Column(Float, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    lecture_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    update_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    lesson = relationship("Lesson", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")


class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id"), nullable=True)
    submission_text = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)
    grade = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    graded_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("Profile", foreign_keys=[user_id], back_populates="submissions")
    assignment = relationship("Assignment", back_populates="submissions")
    grader = relationship("Profile", foreign_keys=[graded_by])








