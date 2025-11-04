-- Migration: Rename lectures to lessons and add comprehensive content type support
-- This migration renames the lectures table to lessons and adds new fields for all content types

BEGIN;

-- Step 1: Create new lessons table with all content type fields
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    is_preview BOOLEAN DEFAULT FALSE,
    
    -- Foreign keys and timestamps
    module_id UUID REFERENCES modules(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Migrate data from lectures to lessons (if lectures table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lectures') THEN
        INSERT INTO lessons (
            id, title, description, content_type, video_url, notes, 
            duration, sequence_order, is_preview, module_id, created_at, updated_at
        )
        SELECT 
            id, title, description, content_type, video_url, notes,
            CASE 
                WHEN duration_minutes IS NOT NULL THEN duration_minutes
                WHEN duration IS NOT NULL THEN ROUND(duration / 60.0)
                ELSE NULL
            END as duration,
            sequence_order, is_preview, module_id, created_at, updated_at
        FROM lectures;
    END IF;
END $$;

-- Step 3: Create new lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    lesson_id UUID REFERENCES lessons(id) NOT NULL,
    progress FLOAT DEFAULT 0.0,
    is_completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, lesson_id)
);

-- Step 4: Migrate data from lecture_progress to lesson_progress (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lecture_progress') THEN
        INSERT INTO lesson_progress (
            id, user_id, lesson_id, progress, is_completed, 
            last_watched_at, completed_at, created_at, updated_at
        )
        SELECT 
            id, user_id, lecture_id, progress, is_completed,
            last_watched_at, completed_at, created_at, updated_at
        FROM lecture_progress;
    END IF;
END $$;

-- Step 5: Update user_progress table to reference lessons
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'lecture_id') THEN
        ALTER TABLE user_progress RENAME COLUMN lecture_id TO lesson_id;
        
        -- Update foreign key constraint if it exists
        IF EXISTS (SELECT FROM information_schema.table_constraints WHERE constraint_name LIKE '%user_progress_lecture_id%') THEN
            ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_lecture_id_fkey;
            ALTER TABLE user_progress ADD CONSTRAINT user_progress_lesson_id_fkey 
                FOREIGN KEY (lesson_id) REFERENCES lessons(id);
        END IF;
    END IF;
END $$;

-- Step 6: Update other tables that reference lectures
-- Update quizzes table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'lecture_id') THEN
        ALTER TABLE quizzes RENAME COLUMN lecture_id TO lesson_id;
        ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_lecture_id_fkey;
        ALTER TABLE quizzes ADD CONSTRAINT quizzes_lesson_id_fkey 
            FOREIGN KEY (lesson_id) REFERENCES lessons(id);
    END IF;
END $$;

-- Update assignments table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'lecture_id') THEN
        ALTER TABLE assignments RENAME COLUMN lecture_id TO lesson_id;
        ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_lecture_id_fkey;
        ALTER TABLE assignments ADD CONSTRAINT assignments_lesson_id_fkey 
            FOREIGN KEY (lesson_id) REFERENCES lessons(id);
    END IF;
END $$;

-- Update discussions table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'lecture_id') THEN
        ALTER TABLE discussions RENAME COLUMN lecture_id TO lesson_id;
        ALTER TABLE discussions DROP CONSTRAINT IF EXISTS discussions_lecture_id_fkey;
        ALTER TABLE discussions ADD CONSTRAINT discussions_lesson_id_fkey 
            FOREIGN KEY (lesson_id) REFERENCES lessons(id);
    END IF;
END $$;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_content_type ON lessons(content_type);
CREATE INDEX IF NOT EXISTS idx_lessons_sequence_order ON lessons(sequence_order);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(is_completed);

-- Step 8: Update content_type enum values (add new types)
-- Note: This assumes you're using a content_type column as TEXT, not an actual ENUM
-- If using PostgreSQL ENUMs, you'd need to use ALTER TYPE commands

-- Step 9: Drop old tables (commented out for safety - uncomment after verifying migration)
-- DROP TABLE IF EXISTS lecture_progress;
-- DROP TABLE IF EXISTS lectures;

COMMIT;

-- Verification queries (run these to verify the migration)
-- SELECT COUNT(*) FROM lessons;
-- SELECT COUNT(*) FROM lesson_progress;
-- SELECT DISTINCT content_type FROM lessons;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lessons' ORDER BY ordinal_position;