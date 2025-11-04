
# Technical Documentation

This section provides technical information about the MedMaster platform architecture, components, and development.

## Platform Architecture

MedMaster is built with a modern tech stack:

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and context
- **Routing**: React Router
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Key Components

### Navigation

The platform uses a consistent navigation component across all pages, providing access to:
- Home
- Dashboard
- Courses
- Webinars
- Profile
- Login/Signup

### Course Components

#### CourseDetail
Displays comprehensive information about a course:
- Course metadata (title, description, instructor)
- Enrollment options
- Content modules and lessons
- Progress tracking
- Reviews and ratings

#### LessonPage
Handles video playback and learning experience:
- Video player with controls
- Progress tracking
- Bookmarking
- Next/previous navigation

### Video Player

The custom video player implements:
- Progress tracking
- Playback controls
- Volume management
- Bookmarking
- Automatic progress saving

### Progress Tracking System

User progress is tracked using:
- LocalStorage for persistence
- Progress percentage calculation
- Visual indicators in UI
- Automatic resume functionality

## Data Structures

### Course
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  instructor: string;
  instructorTitle: string;
  instructorImage: string;
  rating: number;
  reviews: number;
  students: number;
lessons: number;
  duration: string;
  level: string;
  updated: string;
  price: string;
  modules: Module[];
  whatYoullLearn: string[];
  requirements: string[];
}
```

### Module
```typescript
interface Module {
  title: string;
lessons: Lesson[];
}
```

### Lesson (formerly Lecture)
```typescript
interface Lecture {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  progress?: number;
}
```

## Local Storage Usage

The application uses localStorage for persistence of:
- User progress by lesson ID
- Bookmarks
- Volume preferences
- User session data

## Responsive Design Implementation

The platform implements responsive design using:
- Tailwind CSS breakpoints
- Flex and grid layouts
- Mobile-first approach
- Media queries for specific adjustments

## Migration Overview

This project has transitioned from a legacy backend to a FastAPI-based backend. The goal is to standardize data access through HTTP requests to FastAPI endpoints and remove references to legacy backend clients in the frontend.

- Backend: FastAPI with PostgreSQL and local file storage
- Frontend: Replace legacy backend calls with the FastAPI API client
- Integrations: Use `src/integrations/api/` for HTTP client wrappers

Key migration actions:
- Remove the legacy integration directory at `src/integrations/supabase/` (now removed)
- Migrate authentication, course CRUD, enrollment, files, and quiz operations to FastAPI endpoints

For step-by-step guidance, see `DEVELOPMENT_TASK_LIST.md` which tracks the exact tasks, code references, and migration phases.

