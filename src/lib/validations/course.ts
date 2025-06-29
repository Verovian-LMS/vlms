
import * as z from 'zod';

export const courseCategories = [
    'Medical Sciences',
    'Clinical Skills',
    'Anatomy',
    'Physiology',
    'Pathology',
    'Pharmacology',
    'Emergency Medicine',
    'Surgery',
    'Internal Medicine',
    'Pediatrics',
    'Other'
] as const;

export const courseLevels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert'
] as const;

export const lectureContentTypes = [
    'video',
    'pdf',
    'slides',
    'document',
    'audio',
    'interactive',
    'downloadable'
] as const;

// Define the lecture resource schema
const LectureResourceSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Resource title is required'),
    description: z.string().optional(),
    fileUrl: z.string().url('Must be a valid URL'),
    fileType: z.string(),
    fileSize: z.number().optional(),
    isDownloadable: z.boolean().default(true)
});

// Define the lecture schema with clearer validations and multiple content types
const LectureSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Lecture title is required'),
    description: z.string().default(""),
    contentType: z.enum(lectureContentTypes).optional(),
    videoUrl: z.string().nullable().optional(),
    pdfUrl: z.string().nullable().optional(),
    slidesUrl: z.string().nullable().optional(),
    audioUrl: z.string().nullable().optional(),
    documentUrl: z.string().nullable().optional(),
    interactiveUrl: z.string().nullable().optional(),
    downloadableUrl: z.string().nullable().optional(),
    duration: z.number().default(0),
    notes: z.string().default(""),
    resources: z.array(LectureResourceSchema).default([])
});

// Define the module schema with lectures
const ModuleSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Module title is required'),
    description: z.string().default(""),
    lectures: z.array(LectureSchema).default([])
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
export type LectureResourceValues = z.infer<typeof LectureResourceSchema>;
