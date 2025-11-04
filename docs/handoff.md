# Handoff Notes: Dropzone Upload Component

This document records the introduction of a reusable Dropzone component for file uploads and how it’s integrated into the Course creation flow.

## Component Overview
- Path: `src/components/ui/Dropzone.tsx`
- Purpose: Provide a generic, accessible drag-and-drop/file-picker upload UI with progress, preview, and removal actions.
- Used by: `src/components/courses/course-form/ImageUploadField.tsx` and course creation forms.

## Features
- Drag-and-drop file selection with `Browse Files` fallback.
- Displays preview image when `previewUrl` is set.
- Shows progress (`0–100`) and completion state (checkmark overlay when `>= 100`).
- Optional remove button with callback.
- Accepts file type filters and multiple selection.

## API (Props)
- `accept?: string` — e.g., `"image/*"`, `"video/*"`.
- `multiple?: boolean` — allow multiple file selection.
- `disabled?: boolean` — disable interaction when true.
- `onFilesSelected: (files: FileList | File[]) => void` — required handler for dropped/selected files.
- `previewUrl?: string | null` — preview URL or data URI to display.
- `progress?: number` — overall progress `0–100`.
- `onRemove?: () => void` — callback to remove/reset the current file.
- `label?: string` — main dropzone label.
- `helperText?: string` — optional helper caption under the label.
- `className?: string` — container class for layout customization.

## Integration Notes
1. Course Basics (image upload)
   - Wrapper: `src/components/courses/course-form/ImageUploadField.tsx`
   - It forwards `previewUrl`, `progress`, and `onRemove` to Dropzone.
   - On selection: calls `onFileDrop(file)` when provided, or falls back to `onImageSelect` to open a hidden input.

2. Enhanced Course Creation Flow
   - File: `src/components/courses/course-form/EnhancedCourseCreationFlow.tsx`
   - Adds `uploadProgress` state and `handleImageUpload(file)` using a `FileReader` to set `imagePreview` and progress.
   - Passes `uploadProgress` and `onImageUpload={handleImageUpload}` into `BasicInfoStep`.

3. Basic Info Step
   - File: `src/components/courses/course-form/BasicInfoStep.tsx`
   - Renders `ImageUploadField` and wires `onFileDrop` to set `form.imageFile` and call `onImageUpload(file)`.
   - Includes a hidden `<input type="file" id="course-image-input">` for non-dnd selection.

## Example Usage
```tsx
import Dropzone from '@/components/ui/Dropzone';

<Dropzone
  accept="image/*"
  multiple={false}
  previewUrl={preview}
  progress={progress}
  onRemove={() => {
    setFile(null);
    setPreview(null);
  }}
  label="Click or drag file to upload"
  helperText="Recommended size: 800×450"
  onFilesSelected={(files) => {
    const file = Array.isArray(files) ? (files[0] as File) : files[0];
    if (!file) return;
    setFile(file);
    // Start upload or FileReader
  }}
/>
```

## Migration Guidelines
- Prefer `Dropzone` anywhere a file input is currently rendered with custom drag-and-drop logic.
- For server uploads, plug in your POST/upload logic inside `onFilesSelected` and update `progress` and `previewUrl` accordingly.
- For per-file progress with multiple uploads, consider extending Dropzone to render a list and track progress per item.

## Related Changes
- `src/components/ui/Dropzone.tsx` — new generic component.
- `src/components/courses/course-form/ImageUploadField.tsx` — refactored to use Dropzone.
- `src/components/courses/course-form/BasicInfoStep.tsx` — integrated the refactored ImageUploadField and hidden input.
- `src/components/courses/course-form/EnhancedCourseCreationFlow.tsx` — added `uploadProgress` and `onImageUpload` wiring to fix `TypeError: onImageUpload is not a function` when using the enhanced flow.

## Future Enhancements
- Add inline validation and visual error states.
- Support per-file progress and status for multi-file uploads.
- Unify other uploaders (e.g., `ContentTypeUploader.tsx`) to use Dropzone.