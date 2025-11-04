from sqlalchemy import Column, String, DateTime, Integer, Boolean, Text, ForeignKey
from app.core.types import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Discussion(Base):
    __tablename__ = "discussions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    lecture_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    is_pinned = Column(Boolean, default=False)
    is_closed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    course = relationship("Course", back_populates="discussions")
    lesson = relationship("Lesson", back_populates="discussions")
    creator = relationship("Profile")
    posts = relationship("DiscussionPost", back_populates="discussion", cascade="all, delete-orphan")


class DiscussionPost(Base):
    __tablename__ = "discussion_posts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(Text, nullable=False)
    discussion_id = Column(UUID(as_uuid=True), ForeignKey("discussions.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("discussion_posts.id"), nullable=True)
    is_edited = Column(Boolean, default=False)
    posted_at = Column(DateTime(timezone=True), server_default=func.now())
    edited_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    discussion = relationship("Discussion", back_populates="posts")
    author = relationship("Profile")
    parent = relationship("DiscussionPost", remote_side=[id])
    replies = relationship("DiscussionPost", back_populates="parent")








