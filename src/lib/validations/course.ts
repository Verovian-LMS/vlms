
import * as z from 'zod';

export const courseCategories = [
    'Natural Sciences',
    'Applied Skills',
    'Life Sciences',
    'Mathematics',
    'Engineering',
    'Business',
    'Technology',
    'Social Sciences',
    'Arts & Humanities',
    'Languages',
    'Other'
] as const;

export const courseLevels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert'
] as const;

export const lessonContentTypes = [
    'video',
    'pdf',
    'slides',
    'document',
    'audio',
    'interactive',
    'downloadable'
] as const;

// Define the lesson resource schema
const LessonResourceSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Resource title is required'),
    description: z.string().optional(),
    fileUrl: z.string().url('Must be a valid URL'),
    fileType: z.string(),
    fileSize: z.number().optional(),
    isDownloadable: z.boolean().default(true)
});

// Define the lesson schema with clearer validations and multiple content types
const LessonSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Lesson title is required'),
    description: z.string().default(""),
    contentType: z.enum(lessonContentTypes).optional(),
    videoUrl: z.string().nullable().optional(),
    pdfUrl: z.string().nullable().optional(),
    slidesUrl: z.string().nullable().optional(),
    audioUrl: z.string().nullable().optional(),
    documentUrl: z.string().nullable().optional(),
    interactiveUrl: z.string().nullable().optional(),
    downloadableUrl: z.string().nullable().optional(),
    duration: z.number().default(0),
    notes: z.string().default(""),
    resources: z.array(LessonResourceSchema).default([])
});

// Define the module schema with lessons
const ModuleSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Module title is required'),
    description: z.string().default(""),
    lessons: z.array(LessonSchema).default([])
});

// Update the CourseFormSchema to ensure all required fields are properly defined
export const CourseFormSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    longDescription: z.string().min(50, 'Long description must be at least 50 characters'),
    category: z.string().min(1, 'Category is required'),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    imageFile: z.any().nullable().optional(),
    imagePreview: z.string().nullable().optional(),
    modules: z.array(ModuleSchema).default([]),
    uploadStatuses: z.record(z.string(), z.object({
        isUploading: z.boolean(),
        progress: z.number(),
        error: z.string().nullable().optional()
    })).optional()
});

// For backward compatibility, export the schema under two names
export const courseFormSchema = CourseFormSchema;
export const courseSchema = CourseFormSchema;

export type CourseFormValues = z.infer<typeof CourseFormSchema>;
export type LessonResourceValues = z.infer<typeof LessonResourceSchema>;
