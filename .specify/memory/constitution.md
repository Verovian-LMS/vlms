# Learnify Med Skillz Constitution

## Core Principles

### I. Component-First Architecture

Every feature must be built as reusable React components; Components must be self-contained, independently testable, and documented; Clear separation of concerns required - no monolithic components

### II. API-First Design

Every frontend feature must have corresponding backend API endpoints; RESTful design: GET/POST/PUT/DELETE → JSON responses, errors → HTTP status codes; Support both JSON and form data formats

### III. Test-First Development (NON-NEGOTIABLE)

TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced; Minimum 80% code coverage required

### IV. Type Safety

TypeScript strict mode mandatory for all code; All API contracts must be typed with Pydantic schemas; No `any` types allowed without explicit justification

### V. Security by Default

Authentication required for all protected routes; Input validation mandatory on all endpoints; HTTPS enforcement in production; Role-based access control for all operations

## Technical Standards

### Technology Stack

- **Frontend**: React 18+ with TypeScript, Vite, Tailwind CSS, Radix UI components
- **Backend**: FastAPI with Python 3.11+, PostgreSQL, JWT authentication
- **Database**: PostgreSQL with SQLAlchemy ORM, Alembic migrations
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Local file system with organized buckets (course-images, course-videos, course-content)
- **Deployment**: Docker containers, environment-specific configurations
- **Testing**: Jest + React Testing Library, pytest for backend

### Performance Requirements

- Page load times < 3 seconds
- API response times < 500ms for standard operations
- Mobile-responsive design mandatory
- Core Web Vitals compliance required
- Support for 10k+ users, 1M+ content items

### Code Quality Standards

- ESLint + Prettier for code formatting
- Conventional commits for version control
- Comprehensive error handling required
- Documentation for all public APIs and components
- TypeScript strict mode with path aliases (@/\*)

## Development Workflow

### Feature Development Process

1. Feature specification document required
2. Technical design review and approval
3. Implementation with comprehensive tests
4. Code review by at least one team member
5. Integration testing before deployment

### Project Structure

- **Frontend**: `src/` with components, pages, hooks, context, types
- **Backend**: `backend/` with app, models, schemas, API endpoints
- **Database**: PostgreSQL with Alembic migrations
- **File Storage**: `backend/uploads/` with organized buckets
- **Documentation**: `docs/` with user guides and technical docs

### Quality Gates

- All tests must pass before merge
- Code coverage must not decrease
- Security scan must pass
- Performance benchmarks must be met
- Documentation must be updated
- TypeScript compilation must succeed
- ESLint must pass without errors

## Application Features

### Core Functionality

- **User Management**: Registration, authentication, profile management
- **Course Management**: Course creation, editing, module organization
- **Content Delivery**: Video playback, document viewing, interactive content
- **Assessment**: Quizzes, assignments, progress tracking
- **Communication**: Discussion forums, messaging, notifications
- **File Management**: Upload, storage, and organization of course materials

### Technical Features

- **Real-time Updates**: Live progress tracking and notifications
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Radix UI components with custom styling
- **State Management**: React Context API with custom hooks
- **API Integration**: RESTful endpoints with proper error handling
- **File Storage**: Organized bucket system for different content types

## Governance

This constitution supersedes all other development practices. Amendments require documentation, team approval, and migration plan. All PRs must verify compliance with these principles. Complexity must be justified with clear business value.

**Version**: 1.0 | **Ratified**: 2025-09-17 | **Last Amended**: 2025-09-17
