# API Contracts: Prompt Version History Tracking

**Feature**: Prompt Version History Tracking  
**Date**: 2025-09-17  
**Base URL**: `/api/v1/prompts`

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "detail": "Error message",
  "status_code": 400,
  "timestamp": "2025-09-17T10:30:00Z"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Data Models

### Prompt

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "content": "string",
  "author_id": "uuid",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime | null",
  "version_count": "integer"
}
```

### PromptVersion

```json
{
  "id": "uuid",
  "prompt_id": "uuid",
  "version_number": "integer",
  "content": "string",
  "change_summary": "string | null",
  "author_id": "uuid",
  "created_at": "datetime",
  "metadata": "object | null"
}
```

### VersionComment

```json
{
  "id": "uuid",
  "version_id": "uuid",
  "author_id": "uuid",
  "content": "string",
  "created_at": "datetime",
  "updated_at": "datetime | null"
}
```

### VersionDiff

```json
{
  "version_a": "PromptVersion",
  "version_b": "PromptVersion",
  "diff": [
    {
      "type": "equal | insert | delete | replace",
      "content": "string",
      "line_number": "integer | null"
    }
  ],
  "statistics": {
    "lines_added": "integer",
    "lines_removed": "integer",
    "lines_unchanged": "integer"
  }
}
```

## Endpoints

### 1. Prompt Management

#### Create Prompt

```http
POST /api/v1/prompts
```

**Request Body**:

```json
{
  "title": "string",
  "description": "string | null",
  "content": "string"
}
```

**Response**: `201 Created`

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "content": "string",
  "author_id": "uuid",
  "is_active": true,
  "created_at": "datetime",
  "updated_at": "datetime",
  "version_count": 1
}
```

#### Get Prompts

```http
GET /api/v1/prompts
```

**Query Parameters**:

- `skip`: integer (default: 0) - Pagination offset
- `limit`: integer (default: 20, max: 100) - Page size
- `author_id`: uuid (optional) - Filter by author
- `search`: string (optional) - Search in title and content

**Response**: `200 OK`

```json
{
  "items": [Prompt],
  "total": "integer",
  "skip": "integer",
  "limit": "integer"
}
```

#### Get Prompt by ID

```http
GET /api/v1/prompts/{prompt_id}
```

**Response**: `200 OK`

```json
Prompt
```

#### Update Prompt

```http
PUT /api/v1/prompts/{prompt_id}
```

**Request Body**:

```json
{
  "title": "string",
  "description": "string | null",
  "content": "string",
  "change_summary": "string | null"
}
```

**Response**: `200 OK`

```json
Prompt
```

**Note**: This endpoint automatically creates a new version if content changes.

#### Delete Prompt

```http
DELETE /api/v1/prompts/{prompt_id}
```

**Response**: `204 No Content`

**Note**: Soft delete - sets `is_active` to false.

### 2. Version Management

#### Get Prompt Versions

```http
GET /api/v1/prompts/{prompt_id}/versions
```

**Query Parameters**:

- `skip`: integer (default: 0) - Pagination offset
- `limit`: integer (default: 20, max: 100) - Page size
- `order`: string (default: "desc") - Sort order: "asc" or "desc"

**Response**: `200 OK`

```json
{
  "items": [PromptVersion],
  "total": "integer",
  "skip": "integer",
  "limit": "integer"
}
```

#### Get Version by Number

```http
GET /api/v1/prompts/{prompt_id}/versions/{version_number}
```

**Response**: `200 OK`

```json
PromptVersion
```

#### Create Version Comment

```http
POST /api/v1/prompts/{prompt_id}/versions/{version_number}/comments
```

**Request Body**:

```json
{
  "content": "string"
}
```

**Response**: `201 Created`

```json
VersionComment
```

#### Get Version Comments

```http
GET /api/v1/prompts/{prompt_id}/versions/{version_number}/comments
```

**Response**: `200 OK`

```json
{
  "items": [VersionComment],
  "total": "integer"
}
```

### 3. Version Comparison

#### Compare Versions

```http
GET /api/v1/prompts/{prompt_id}/versions/{version_a}/compare/{version_b}
```

**Response**: `200 OK`

```json
VersionDiff
```

#### Get Version Diff (Unified Format)

```http
GET /api/v1/prompts/{prompt_id}/versions/{version_a}/diff/{version_b}
```

**Query Parameters**:

- `format`: string (default: "unified") - Output format: "unified" or "side-by-side"

**Response**: `200 OK`

```json
{
  "diff": "string",
  "statistics": {
    "lines_added": "integer",
    "lines_removed": "integer",
    "lines_unchanged": "integer"
  }
}
```

### 4. Version Operations

#### Revert to Version

```http
POST /api/v1/prompts/{prompt_id}/versions/{version_number}/revert
```

**Request Body**:

```json
{
  "change_summary": "string | null"
}
```

**Response**: `201 Created`

```json
{
  "prompt": Prompt,
  "new_version": PromptVersion
}
```

**Note**: Creates a new version with the content from the specified version.

#### Get Version Statistics

```http
GET /api/v1/prompts/{prompt_id}/versions/statistics
```

**Response**: `200 OK`

```json
{
  "total_versions": "integer",
  "first_version_date": "datetime",
  "last_version_date": "datetime",
  "most_active_author": {
    "id": "uuid",
    "name": "string",
    "version_count": "integer"
  },
  "average_changes_per_version": "number"
}
```

## Request/Response Examples

### Create a New Prompt

```http
POST /api/v1/prompts
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
  "title": "Medical Diagnosis Prompt",
  "description": "Prompt for AI-assisted medical diagnosis",
  "content": "You are a medical AI assistant. Analyze the following symptoms and provide a differential diagnosis..."
}
```

**Response**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Medical Diagnosis Prompt",
  "description": "Prompt for AI-assisted medical diagnosis",
  "content": "You are a medical AI assistant. Analyze the following symptoms and provide a differential diagnosis...",
  "author_id": "987fcdeb-51a2-43d1-b456-426614174000",
  "is_active": true,
  "created_at": "2025-09-17T10:30:00Z",
  "updated_at": "2025-09-17T10:30:00Z",
  "version_count": 1
}
```

### Compare Two Versions

```http
GET /api/v1/prompts/123e4567-e89b-12d3-a456-426614174000/versions/1/compare/2
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Response**:

```json
{
  "version_a": {
    "id": "111e4567-e89b-12d3-a456-426614174000",
    "version_number": 1,
    "content": "You are a medical AI assistant...",
    "created_at": "2025-09-17T10:30:00Z"
  },
  "version_b": {
    "id": "222e4567-e89b-12d3-a456-426614174000",
    "version_number": 2,
    "content": "You are an advanced medical AI assistant...",
    "created_at": "2025-09-17T11:00:00Z"
  },
  "diff": [
    {
      "type": "equal",
      "content": "You are a ",
      "line_number": 1
    },
    {
      "type": "delete",
      "content": "medical ",
      "line_number": 1
    },
    {
      "type": "insert",
      "content": "advanced medical ",
      "line_number": 1
    },
    {
      "type": "equal",
      "content": "AI assistant...",
      "line_number": 1
    }
  ],
  "statistics": {
    "lines_added": 1,
    "lines_removed": 1,
    "lines_unchanged": 2
  }
}
```

## Validation Rules

### Prompt Creation/Update

- `title`: Required, 1-255 characters
- `description`: Optional, max 1000 characters
- `content`: Required, non-empty, max 100,000 characters
- `change_summary`: Optional, max 500 characters

### Version Comment

- `content`: Required, non-empty, max 2000 characters

### Query Parameters

- `skip`: Non-negative integer
- `limit`: Integer between 1-100
- `order`: Must be "asc" or "desc"
- `search`: Max 100 characters

## Rate Limiting

- Create/Update operations: 10 requests per minute per user
- Read operations: 100 requests per minute per user
- Comparison operations: 20 requests per minute per user

## Caching

- Version lists cached for 5 minutes
- Version content cached for 1 hour
- Diff results cached for 30 minutes
- Statistics cached for 15 minutes

## WebSocket Events (Future)

For real-time updates, the following WebSocket events will be available:

```json
{
  "event": "version_created",
  "data": {
    "prompt_id": "uuid",
    "version": PromptVersion
  }
}

{
  "event": "version_updated",
  "data": {
    "prompt_id": "uuid",
    "version": PromptVersion
  }
}
```
