from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from app.core.database import get_async_db
from app.models.course import Course, Module, Lesson, Enrollment, LessonProgress  # Updated import
from app.models.user import Profile
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse,
    ModuleCreate, ModuleUpdate, ModuleResponse,
    LessonCreate, LessonUpdate, LessonResponse,
    EnrollmentCreate, EnrollmentResponse,
    LessonProgressCreate, LessonProgressResponse,
    UserActivityResponse
)
from app.api.v1.endpoints.simple_auth import get_current_user
from app.schemas.user import ProfileResponse
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/health")
async def courses_health():
    """Lightweight health check for the courses service."""
    return {"status": "ok", "service": "courses"}


@router.post("/", response_model=CourseResponse)
async def create_course(
    course_data: CourseCreate,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create a new course."""
    course = Course(
        **course_data.dict(),
        author_id=current_user.id
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    
    return CourseResponse.from_orm(course)


@router.get("/", response_model=List[CourseResponse])
async def get_courses(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_async_db)
):
    """Get all courses with optional filtering."""
    query = select(Course).options(
        selectinload(Course.modules).selectinload(Module.lessons)
    )
    
    if category:
        query = query.where(Course.category == category)
    
    if featured is not None:
        query = query.where(Course.is_featured == featured)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    courses = result.scalars().all()
    
    responses: List[CourseResponse] = []
    for course in courses:
        # Compute counts via explicit queries to avoid lazy loads in async context
        module_count_result = await db.execute(
            select(func.count(Module.id)).where(Module.course_id == course.id)
        )
        module_count = module_count_result.scalar() or 0

        lesson_count_result = await db.execute(
            select(func.count(Lesson.id))
            .join(Module, Lesson.module_id == Module.id)
            .where(Module.course_id == course.id)
        )
        lesson_count = lesson_count_result.scalar() or 0

        base = CourseResponse.from_orm(course)
        data = base.dict()
        data["module_count"] = module_count
        data["lesson_count"] = lesson_count
        responses.append(CourseResponse(**data))
    
    return responses


@router.get("/my-courses", response_model=List[CourseResponse])
async def get_my_courses(
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get courses enrolled by current user."""
    result = await db.execute(
        select(Course)
        .join(Enrollment)
        .where(Enrollment.user_id == current_user.id)
    )
    courses = result.scalars().all()
    
    return [CourseResponse.from_orm(course) for course in courses]


@router.get("/recent-activity", response_model=List[UserActivityResponse])
async def recent_activity(
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get recent activity for the current user from lesson progress."""
    ordering_ts = func.coalesce(
        LessonProgress.completed_at,
        LessonProgress.last_watched_at,
        LessonProgress.created_at,
    )

    result = await db.execute(
        select(
            LessonProgress,
            Lesson.title.label("lesson_title"),
            Lesson.content_type.label("content_type"),
            Module.title.label("module_title"),
            Course.title.label("course_title"),
            ordering_ts.label("event_time"),
        )
        .join(Lesson, Lesson.id == LessonProgress.lesson_id)
        .join(Module, Module.id == Lesson.module_id)
        .join(Course, Course.id == Module.course_id)
        .where(LessonProgress.user_id == current_user.id)
        .order_by(ordering_ts.desc())
        .limit(20)
    )

    rows = result.all()
    activities: List[UserActivityResponse] = []
    for row in rows:
        progress: LessonProgress = row[0]
        lesson_title: str = row[1] or "Untitled Lesson"
        content_type: Optional[str] = row[2]
        course_title: str = row[4] or "Course"
        event_time: datetime = row[5] or progress.created_at

        status = "Completed" if progress.is_completed else "Viewed"
        activity_type = f"{(content_type or 'Lesson').capitalize()} {status}"
        name = f"{lesson_title} • {course_title}"

        activities.append(UserActivityResponse(
            id=progress.id,
            type=activity_type,
            name=name,
            created_at=event_time,
            details=None,
        ))

    return activities


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_async_db)
):
    """Get course by ID."""
    # Use selectinload to eagerly load related data
    result = await db.execute(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
    )
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Calculate module and lesson counts via explicit queries to avoid lazy loads
    module_count_result = await db.execute(
        select(func.count(Module.id)).where(Module.course_id == course.id)
    )
    module_count = module_count_result.scalar() or 0

    lesson_count_result = await db.execute(
        select(func.count(Lesson.id))
        .join(Module, Lesson.module_id == Module.id)
        .where(Module.course_id == course.id)
    )
    lesson_count = lesson_count_result.scalar() or 0
    
    # Create response with properly formatted data
    response_data = CourseResponse.from_orm(course)
    
    # Add additional fields expected by frontend
    response_dict = response_data.dict()
    response_dict["module_count"] = module_count
    response_dict["lesson_count"] = lesson_count
    
    # Return enhanced response
    return CourseResponse(**response_dict)


@router.get("/{course_id}/progress", response_model=dict)
async def get_course_progress(
    course_id: UUID,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get user's progress for a specific course."""
    # First verify the course exists
    course_result = await db.execute(
        select(Course)
        .where(Course.id == course_id)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
    )
    course = course_result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Get all lesson IDs in the course via explicit query
    lessons_result = await db.execute(
        select(Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .where(Module.course_id == course_id)
    )
    lesson_ids = lessons_result.scalars().all()
    total_lessons = len(lesson_ids)
    if total_lessons == 0:
        return {"progress": 0, "completed_lessons": 0, "total_lessons": 0}
    
    # Count completed lessons for the current user
    completed_count_result = await db.execute(
        select(func.count(LessonProgress.id)).where(
            and_(
                LessonProgress.lesson_id.in_(lesson_ids),
                LessonProgress.user_id == current_user.id,
                LessonProgress.is_completed == True
            )
        )
    )
    completed_lessons = completed_count_result.scalar() or 0
    
    # Calculate overall progress percentage
    progress_percentage = round((completed_lessons / total_lessons) * 100, 1)
    
    return {
        "progress": progress_percentage,
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons
    }


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: UUID,
    course_update: CourseUpdate,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update course."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if user is the author or admin
    if course.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this course"
        )
    
    # Update course fields
    update_data = course_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    await db.commit()
    await db.refresh(course)
    
    return CourseResponse.from_orm(course)


@router.delete("/{course_id}")
async def delete_course(
    course_id: UUID,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Delete course."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if user is the author or admin
    if course.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this course"
        )
    
    await db.delete(course)
    await db.commit()
    
    return {"message": "Course deleted successfully"}


# Module endpoints
@router.post("/{course_id}/modules", response_model=ModuleResponse)
async def create_module(
    course_id: UUID,
    module_data: ModuleCreate,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create a new module for a course."""
    # Verify course exists and user has permission
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if course.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create modules for this course"
        )
    
    module = Module(
        **module_data.dict(),
        course_id=course_id
    )
    db.add(module)
    await db.commit()
    await db.refresh(module)
    
    return ModuleResponse.from_orm(module)


@router.get("/{course_id}/modules", response_model=List[ModuleResponse])
async def get_course_modules(
    course_id: UUID,
    db: AsyncSession = Depends(get_async_db)
):
    """Get all modules for a course."""
    result = await db.execute(
        select(Module)
        .where(Module.course_id == course_id)
        .order_by(Module.sequence_order)
    )
    modules = result.scalars().all()
    
    return [ModuleResponse.from_orm(module) for module in modules]


@router.put("/{course_id}/modules/{module_id}", response_model=ModuleResponse)
async def update_module(
    course_id: UUID,
    module_id: UUID,
    module_data: ModuleUpdate,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update a module for a course."""
    # Verify course exists
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Verify module exists and belongs to course
    module_result = await db.execute(select(Module).where(Module.id == module_id))
    module = module_result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    if module.course_id != course_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Module does not belong to course")

    # Permission check
    if course.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this module")

    # Update fields
    for field, value in module_data.dict(exclude_unset=True).items():
        if hasattr(Module, field):
            setattr(module, field, value)
    await db.commit()
    await db.refresh(module)
    return ModuleResponse.from_orm(module)


@router.delete("/{course_id}/modules/{module_id}")
async def delete_module(
    course_id: UUID,
    module_id: UUID,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Delete a module from a course."""
    # Verify course exists
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    # Verify module exists and belongs to course
    module_result = await db.execute(select(Module).where(Module.id == module_id))
    module = module_result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    if module.course_id != course_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Module does not belong to course")

    # Permission check
    if course.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this module")

    await db.delete(module)
    await db.commit()
    return {"message": "Module deleted successfully"}


# Lesson endpoints (new)
@router.post("/modules/{module_id}/lessons", response_model=LessonResponse)
async def create_lesson(
    module_id: UUID,
    lesson_data: LessonCreate,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create a new lesson for a module."""
    # Verify module exists and user has permission
    result = await db.execute(
        select(Module)
        .options(selectinload(Module.course))
        .where(Module.id == module_id)
    )
    module = result.scalar_one_or_none()
    
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )
    
    if module.course.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create lessons for this module"
        )
    
    # Only pass attributes that exist on the Lesson model to avoid constructor errors
    incoming = lesson_data.dict(exclude_unset=True)
    safe_kwargs = {k: v for k, v in incoming.items() if hasattr(Lesson, k)}

    # Defensive type coercion for numeric fields that may arrive as strings
    def coerce_int(value):
        try:
            if value is None or (isinstance(value, str) and value.strip() == ""):
                return None
            return int(value)
        except Exception:
            return None

    for key in [
        "duration",
        "page_count",
        "slide_count",
        "reading_time",
        "sequence_order",
    ]:
        if key in safe_kwargs:
            safe_kwargs[key] = coerce_int(safe_kwargs[key])

    try:
        lesson = Lesson(
            **safe_kwargs,
            module_id=module_id
        )
        db.add(lesson)
        await db.commit()
        await db.refresh(lesson)
    except Exception as e:
        # Roll back and surface a clear error for easier debugging
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create lesson: {str(e)}"
        )
    
    return LessonResponse.from_orm(lesson)


@router.get("/modules/{module_id}/lessons", response_model=List[LessonResponse])
async def get_module_lessons(
    module_id: UUID,
    db: AsyncSession = Depends(get_async_db)
):
    """Get all lessons for a module."""
    result = await db.execute(
        select(Lesson)
        .where(Lesson.module_id == module_id)
        .order_by(Lesson.sequence_order)
    )
    lessons = result.scalars().all()
    
    return [LessonResponse.from_orm(lesson) for lesson in lessons]


@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: UUID,
    db: AsyncSession = Depends(get_async_db)
):
    """Get a specific lesson by ID."""
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.module).selectinload(Module.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()

    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    return LessonResponse.from_orm(lesson)


@router.get("/lessons/{lesson_id}/progress", response_model=LessonProgressResponse)
async def get_lesson_progress(
    lesson_id: UUID,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get the current user's progress for a specific lesson."""
    result = await db.execute(
        select(LessonProgress)
        .where(and_(
            LessonProgress.lesson_id == lesson_id,
            LessonProgress.user_id == current_user.id
        ))
    )
    progress = result.scalar_one_or_none()

    if not progress:
        # Return a default progress response with valid required fields
        return LessonProgressResponse(
            id=uuid.uuid4(),
            user_id=current_user.id,
            lesson_id=lesson_id,
            progress=0.0,
            is_completed=False,
            last_watched_at=None,
            completed_at=None,
            created_at=datetime.utcnow(),
            updated_at=None,
        )

    return LessonProgressResponse.from_orm(progress)


@router.post("/lessons/{lesson_id}/progress", response_model=LessonProgressResponse)
async def upsert_lesson_progress(
    lesson_id: UUID,
    progress_data: LessonProgressCreate,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create or update the current user's progress for a specific lesson."""
    # Normalize lesson_id from path
    progress_value = progress_data.progress if progress_data.progress is not None else 0.0
    is_completed = bool(progress_data.is_completed)

    # Check existing progress
    existing_result = await db.execute(
        select(LessonProgress)
        .where(and_(
            LessonProgress.lesson_id == lesson_id,
            LessonProgress.user_id == current_user.id
        ))
    )
    existing = existing_result.scalar_one_or_none()

    if existing:
        # Only update if new progress is greater or completion status changed
        if progress_value > (existing.progress or 0) or is_completed != existing.is_completed:
            existing.progress = progress_value
            existing.is_completed = is_completed
            existing.last_watched_at = func.now()
            existing.completed_at = func.now() if is_completed else None
            await db.commit()
            await db.refresh(existing)
        return LessonProgressResponse.from_orm(existing)

    # Create new progress record
    progress = LessonProgress(
        user_id=current_user.id,
        lesson_id=lesson_id,
        progress=progress_value,
        is_completed=is_completed,
        last_watched_at=func.now(),
        completed_at=func.now() if is_completed else None,
    )
    db.add(progress)
    await db.commit()
    await db.refresh(progress)
    return LessonProgressResponse.from_orm(progress)


@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: UUID,
    lesson_data: LessonUpdate,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update a lesson."""
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.module).selectinload(Module.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    if lesson.module.course.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this lesson"
        )
    
    # Update lesson fields
    for field, value in lesson_data.dict(exclude_unset=True).items():
        if hasattr(Lesson, field):
            setattr(lesson, field, value)
    
    await db.commit()
    await db.refresh(lesson)
    
    return LessonResponse.from_orm(lesson)


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: UUID,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Delete a lesson."""
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.module).selectinload(Module.course))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    if lesson.module.course.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this lesson"
        )
    
    await db.delete(lesson)
    await db.commit()
    
    return {"message": "Lesson deleted successfully"}


# Legacy Lecture endpoints removed for full consistency with lessons-only API


# Enrollment endpoints
@router.post("/{course_id}/enroll", response_model=EnrollmentResponse)
async def enroll_in_course(
    course_id: UUID,
    current_user: ProfileResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Enroll current user in a course."""
    # Check if already enrolled
    result = await db.execute(
        select(Enrollment).where(
            and_(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == course_id
            )
        )
    )
    existing_enrollment = result.scalar_one_or_none()
    
    if existing_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course_id
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    
    return EnrollmentResponse.from_orm(enrollment)








