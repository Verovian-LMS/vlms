from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from app.core.types import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    certificate_url = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=True)
    issued_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    verification_code = Column(String, nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("Profile", foreign_keys=[user_id], back_populates="certificates")
    course = relationship("Course")
    issuer = relationship("Profile", foreign_keys=[issued_by])








