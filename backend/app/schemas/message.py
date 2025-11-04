from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class MessageCreate(BaseModel):
    recipient_id: UUID
    content: str


class MessageResponse(BaseModel):
    id: UUID
    sender_id: UUID
    recipient_id: UUID
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ContactResponse(BaseModel):
    id: UUID
    name: Optional[str]
    avatar: Optional[str]
    last_message: Optional[str]
    last_message_time: Optional[datetime]
    unread_count: int = 0


class ConversationResponse(BaseModel):
    messages: List[MessageResponse]