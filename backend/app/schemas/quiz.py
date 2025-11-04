from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    max_attempts: Optional[int] = None
    passing_score: Optional[float] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    max_attempts: Optional[int] = None
    passing_score: Optional[float] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None


class QuizResponse(BaseModel):
    id: UUID
    title: Optional[str]
    description: Optional[str]
    lecture_id: Optional[UUID]
    time_limit_minutes: Optional[int]
    max_attempts: Optional[int]
    passing_score: Optional[float]
    available_from: Optional[datetime]
    available_to: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    question_text: str
    question_type: str
    points: Optional[int] = None
    sequence_order: Optional[int] = None


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    points: Optional[int] = None
    sequence_order: Optional[int] = None


class QuestionResponse(BaseModel):
    id: UUID
    question_text: Optional[str]
    question_type: Optional[str]
    points: Optional[int]
    sequence_order: Optional[int]
    quiz_id: Optional[UUID]
    
    class Config:
        from_attributes = True


class AnswerCreate(BaseModel):
    answer_text: str
    is_correct: bool
    sequence_order: Optional[int] = None


class AnswerUpdate(BaseModel):
    answer_text: Optional[str] = None
    is_correct: Optional[bool] = None
    sequence_order: Optional[int] = None


class AnswerResponse(BaseModel):
    id: UUID
    answer_text: Optional[str]
    is_correct: Optional[bool]
    sequence_order: Optional[int]
    questions_id: Optional[UUID]
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuizAttemptCreate(BaseModel):
    quiz_id: UUID


class QuizAttemptResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    quiz_id: Optional[UUID]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    status: Optional[str]
    score: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuizResponseCreate(BaseModel):
    question_id: UUID
    answer_id: Optional[UUID] = None
    response_text: Optional[str] = None


class QuizResponseResponse(BaseModel):
    id: UUID
    attempt_id: Optional[UUID]
    question_id: Optional[UUID]
    answer_id: Optional[UUID]
    response_text: Optional[str]
    is_correct: Optional[bool]
    points_earned: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True








