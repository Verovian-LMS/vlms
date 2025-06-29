
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
- Content modules and lectures
- Progress tracking
- Reviews and ratings

#### LecturePage
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
  lectures: number;
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
  lectures: Lecture[];
}
```

### Lecture
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
- User progress by lecture ID
- Bookmarks
- Volume preferences
- User session data

## Responsive Design Implementation

The platform implements responsive design using:
- Tailwind CSS breakpoints
- Flex and grid layouts
- Mobile-first approach
- Media queries for specific adjustments

