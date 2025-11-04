from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func, update
from typing import List
from uuid import UUID

from app.core.database import get_async_db
from app.api.v1.endpoints.simple_auth import get_current_user
from app.schemas.user import ProfileResponse
from app.schemas.message import (
    MessageCreate,
    MessageResponse,
    ContactResponse,
    ConversationResponse,
)
from app.models.message import Message
from app.models.user import Profile

router = APIRouter()


@router.get("/contacts", response_model=List[ContactResponse])
async def get_contacts(
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Return contacts the user has messaged with, including metadata."""
    # Find distinct user IDs that have exchanged messages with current user
    sent_result = await db.execute(
        select(Message.recipient_id).where(Message.sender_id == current_user.id)
    )
    received_result = await db.execute(
        select(Message.sender_id).where(Message.recipient_id == current_user.id)
    )

    recipient_ids = {row[0] for row in sent_result.all()}
    sender_ids = {row[0] for row in received_result.all()}
    contact_ids = (recipient_ids | sender_ids) - {current_user.id}

    if not contact_ids:
        return []

    # Fetch contact profiles
    profiles_result = await db.execute(
        select(Profile).where(Profile.id.in_(list(contact_ids)))
    )
    profiles = profiles_result.scalars().all()

    contacts: List[ContactResponse] = []
    for profile in profiles:
        # Last message between users
        last_message_result = await db.execute(
            select(Message)
            .where(
                or_(
                    and_(Message.sender_id == current_user.id, Message.recipient_id == profile.id),
                    and_(Message.sender_id == profile.id, Message.recipient_id == current_user.id),
                )
            )
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_message = last_message_result.scalars().first()

        # Unread count from this contact
        unread_result = await db.execute(
            select(func.count(Message.id))
            .where(
                and_(
                    Message.sender_id == profile.id,
                    Message.recipient_id == current_user.id,
                    Message.is_read == False,
                )
            )
        )
        unread_count = unread_result.scalar() or 0

        contacts.append(
            ContactResponse(
                id=profile.id,
                name=profile.name,
                avatar=profile.avatar,
                last_message=last_message.content if last_message else None,
                last_message_time=last_message.created_at if last_message else None,
                unread_count=unread_count,
            )
        )

    # Sort by last message time desc, treating None as oldest
    def sort_key(c: ContactResponse):
        return (c.last_message_time.timestamp() if c.last_message_time else 0)
    contacts.sort(key=sort_key, reverse=True)
    return contacts


@router.get("/conversation/{contact_id}", response_model=ConversationResponse)
async def get_conversation(
    contact_id: UUID,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get all messages between the current user and a contact."""
    result = await db.execute(
        select(Message)
        .where(
            or_(
                and_(Message.sender_id == current_user.id, Message.recipient_id == contact_id),
                and_(Message.sender_id == contact_id, Message.recipient_id == current_user.id),
            )
        )
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()
    return ConversationResponse(messages=[MessageResponse.from_orm(m) for m in messages])


@router.post("/send", response_model=MessageResponse)
async def send_message(
    payload: MessageCreate,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Send a message to a recipient."""
    if not payload.content.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Content required")

    message = Message(
        sender_id=current_user.id,
        recipient_id=payload.recipient_id,
        content=payload.content.strip(),
        is_read=False,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return MessageResponse.from_orm(message)


@router.post("/mark-read")
async def mark_read(
    contact_id: UUID,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Mark messages from a contact as read for the current user."""
    await db.execute(
        update(Message)
        .where(
            and_(
                Message.sender_id == contact_id,
                Message.recipient_id == current_user.id,
                Message.is_read == False,
            )
        )
        .values(is_read=True)
    )
    await db.commit()
    return {"status": "ok"}