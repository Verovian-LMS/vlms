from sqlalchemy import Column, String, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.types import UUID
import uuid
import enum
from app.core.database import Base


class Role(str, enum.Enum):
    STUDENT = "student"
    CREATOR = "creator"
    ADMIN = "admin"


class AccountStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(String, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    role = Column(Enum('student', 'creator', 'admin', name='role'), nullable=False)
    specialty = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    account_status = Column(Enum(AccountStatus), default=AccountStatus.ACTIVE)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    courses = relationship("Course", back_populates="author")
    enrollments = relationship("Enrollment", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    messages_sent = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    messages_received = relationship("Message", foreign_keys="Message.recipient_id", back_populates="recipient")
    instructor_messages = relationship("InstructorMessage", back_populates="instructor")
    submissions = relationship("Submission", foreign_keys="Submission.user_id", back_populates="user")
    certificates = relationship("Certificate", foreign_keys="Certificate.user_id", back_populates="user")
    notifications = relationship("Notification", back_populates="user")








