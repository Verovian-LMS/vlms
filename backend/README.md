# Learnify Med Skillz - FastAPI Backend

A comprehensive FastAPI backend for the medical education platform, using PostgreSQL and local file storage.

## Features

- **Authentication**: JWT-based authentication with user registration/login
- **File Storage**: Local file storage for course images, videos, and content
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
- **API**: RESTful API with automatic documentation
- **Security**: CORS, password hashing, and JWT tokens
- **Models**: Complete data models aligned with the platform schema

## Quick Start

### Using Docker (Recommended)

1. **Clone and navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Start the services**

   ```bash
   docker-compose up --build
   ```

3. **Access the API**
   - API Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

### Manual Setup

1. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL database**

   ```sql
   CREATE DATABASE learnify_med_skillz;
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE learnify_med_skillz TO postgres;
   ```

3. **Configure environment**

   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Run migrations**

   ```bash
   alembic upgrade head
   ```

5. **Start the server**
   ```bash
   python run.py
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/logout` - Logout user

### Courses

- `GET /api/v1/courses/` - List all courses
- `POST /api/v1/courses/` - Create new course
- `GET /api/v1/courses/{course_id}` - Get course details
- `PUT /api/v1/courses/{course_id}` - Update course
- `DELETE /api/v1/courses/{course_id}` - Delete course

### Modules

- `POST /api/v1/courses/{course_id}/modules` - Create module
- `GET /api/v1/courses/{course_id}/modules` - List course modules

### Lectures

- `POST /api/v1/courses/modules/{module_id}/lectures` - Create lecture
- `GET /api/v1/courses/modules/{module_id}/lectures` - List module lectures

### File Upload

- `POST /api/v1/files/upload/course-image` - Upload course image
- `POST /api/v1/files/upload/course-video` - Upload course video
- `POST /api/v1/files/upload/course-content` - Upload course content
- `DELETE /api/v1/files/delete/{bucket}/{filename}` - Delete file

### Enrollment

- `POST /api/v1/courses/{course_id}/enroll` - Enroll in course
- `GET /api/v1/courses/my-courses` - Get enrolled courses

## Database Schema

The database includes all the core platform tables:

- **Users & Profiles**: User authentication and profile management
- **Courses**: Course management with modules and lectures
- **Quizzes**: Quiz system with questions and answers
- **Enrollments**: Course enrollment tracking
- **Progress**: User progress tracking
- **Discussions**: Course discussions and posts
- **Messages**: User messaging system
- **Certificates**: Course completion certificates
- **Notifications**: User notifications

## File Storage

Files are stored locally in the `uploads/` directory with the following structure:

```
uploads/
├── course-images/
├── course-videos/
└── course-content/
```

Files are accessible via HTTP at:

- `http://localhost:8000/uploads/course-images/{filename}`
- `http://localhost:8000/uploads/course-videos/{filename}`
- `http://localhost:8000/uploads/course-content/{filename}`

## Environment Variables

Key environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/learnify_med_skillz

# JWT
SECRET_KEY=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE=100MB

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# App
DEBUG=true
ENVIRONMENT=development
```

## Development

### Running Tests

```bash
pytest
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Code Formatting

```bash
black app/
isort app/
```

## Production Deployment

1. **Set production environment variables**
2. **Use a production PostgreSQL database**
3. **Configure proper CORS origins**
4. **Use a reverse proxy (nginx) for file serving**
5. **Set up SSL/TLS certificates**
6. **Configure logging and monitoring**

## Integration with Frontend

To integrate with your React frontend:

1. **Update API base URL** in your frontend to `http://localhost:8000/api/v1`
2. **Use HTTP requests** to FastAPI endpoints for data access
3. **Update authentication** to use JWT tokens from FastAPI
4. **Update file uploads** to use FastAPI file upload endpoints

Example frontend API client:

```javascript
const API_BASE = "http://localhost:8000/api/v1";

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Upload file
const uploadFile = async (file, type, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/files/upload/${type}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return response.json();
};
```

## Support

For issues or questions, please check the API documentation at `/docs` or contact the development team.








