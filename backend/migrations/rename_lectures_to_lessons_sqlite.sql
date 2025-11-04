-- SQLite Migration: Rename lectures to lessons and add content type fields
-- Step 1: Create new lessons table with all content type fields
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    content_type TEXT,

    -- Content URLs and files
    video_url TEXT,
    pdf_url TEXT,
    slides_url TEXT,
    audio_url TEXT,
    interactive_url TEXT,
    download_url TEXT,

    -- Content metadata
    content TEXT, -- For document/text content
    transcript TEXT, -- For video/audio transcripts
    notes TEXT,

    -- Content properties
    duration INTEGER, -- Duration in minutes
    page_count INTEGER, -- For PDF documents
    slide_count INTEGER, -- For presentations
    reading_time INTEGER, -- For text content in minutes
    file_size TEXT, -- For downloadable files
    file_type TEXT, -- File extension/type
    completion_criteria TEXT, -- For interactive content

    -- Lesson settings
    sequence_order INTEGER,
    is_preview INTEGER DEFAULT 0, -- SQLite uses INTEGER for boolean

    -- Foreign keys and timestamps
    module_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- Step 2: Migrate existing data from lectures to lessons (if lectures table exists)
INSERT OR IGNORE INTO lessons (
    id, title, description, content_type, video_url, content, notes,
    duration, sequence_order, is_preview, module_id, created_at, updated_at
)
SELECT 
    id, title, description, content_type, video_url, content, notes,
    duration, sequence_order, is_preview, module_id, created_at, updated_at
FROM lectures
WHERE EXISTS (SELECT name FROM sqlite_master WHERE type='table' AND name='lectures');

-- Step 3: Create new lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    progress REAL DEFAULT 0.0,
    completion_status TEXT DEFAULT 'not_started',
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Step 4: Migrate existing lecture_progress data (if table exists)
INSERT OR IGNORE INTO lesson_progress (
    id, user_id, lesson_id, course_id, progress, completion_status,
    completed_at, created_at, updated_at
)
SELECT 
    id, user_id, lecture_id, course_id, progress, completion_status,
    completed_at, created_at, updated_at
FROM lecture_progress
WHERE EXISTS (SELECT name FROM sqlite_master WHERE type='table' AND name='lecture_progress');

-- Step 5: Update user_progress table to reference lessons instead of lectures
-- First, create a backup of user_progress
CREATE TABLE IF NOT EXISTS user_progress_backup AS 
SELECT * FROM user_progress
WHERE EXISTS (SELECT name FROM sqlite_master WHERE type='table' AND name='user_progress');

-- Update user_progress to use lesson_id instead of lecture_id (if column exists)
-- Note: SQLite doesn't support ALTER COLUMN, so we'll create a new table if needed

-- Step 6: Update other tables that reference lectures
-- Update quizzes table (if it has lecture_id column)
-- Update assignments table (if it has lecture_id column)  
-- Update discussions table (if it has lecture_id column)

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_content_type ON lessons(content_type);
CREATE INDEX IF NOT EXISTS idx_lessons_sequence_order ON lessons(sequence_order);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);

-- Note: In SQLite, we keep the old tables for now to avoid data loss
-- The application will use the new 'lessons' and 'lesson_progress' tables
-- Old tables can be dropped manually after verifying the migration worked correctly