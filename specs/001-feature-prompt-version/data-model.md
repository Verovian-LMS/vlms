# Data Model: Prompt Version History Tracking

**Feature**: Prompt Version History Tracking  
**Date**: 2025-09-17  
**Database**: PostgreSQL with SQLAlchemy ORM

## Entity Overview

The version tracking system introduces three new entities to the existing database schema:

1. **Prompt** - The main prompt entity (new)
2. **PromptVersion** - Individual versions of prompts
3. **VersionComment** - Optional comments on versions

## Entity Definitions

### 1. Prompt

**Purpose**: Represents a prompt that can have multiple versions

```python
class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)  # Current version content
    author_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("Profile", back_populates="prompts")
    versions = relationship("PromptVersion", back_populates="prompt", cascade="all, delete-orphan")
```

**Key Attributes**:

- `id`: Unique identifier (UUID)
- `title`: Human-readable prompt title
- `description`: Optional description of prompt purpose
- `content`: Current version content (denormalized for performance)
- `author_id`: Reference to profile who created the prompt
- `is_active`: Soft delete flag
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp

**Validation Rules**:

- Title must be 1-255 characters
- Content must be non-empty
- Author must exist in profiles table

### 2. PromptVersion

**Purpose**: Represents a specific version of a prompt with complete content and metadata

```python
class PromptVersion(Base):
    __tablename__ = "prompt_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prompt_id = Column(UUID(as_uuid=True), ForeignKey("prompts.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    change_summary = Column(String(500), nullable=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    metadata = Column(JSONB, nullable=True)  # Flexible metadata storage

    # Relationships
    prompt = relationship("Prompt", back_populates="versions")
    author = relationship("Profile")
    comments = relationship("VersionComment", back_populates="version", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('ix_prompt_versions_prompt_id_version', 'prompt_id', 'version_number'),
        Index('ix_prompt_versions_created_at', 'created_at'),
    )
```

**Key Attributes**:

- `id`: Unique identifier (UUID)
- `prompt_id`: Reference to parent prompt
- `version_number`: Sequential version number (1, 2, 3, ...)
- `content`: Complete content of this version
- `change_summary`: Optional summary of changes made
- `author_id`: User who created this version
- `created_at`: Version creation timestamp
- `metadata`: JSONB field for flexible metadata (file size, word count, tags, etc.)

**Validation Rules**:

- Version number must be positive integer
- Content must be non-empty
- Version number must be unique per prompt
- Author must exist in profiles table

**State Transitions**:

- Created → Immutable (versions cannot be modified after creation)
- Deleted → Soft delete (mark as deleted, preserve for audit)

### 3. VersionComment

**Purpose**: Optional comments attached to specific versions for documentation

```python
class VersionComment(Base):
    __tablename__ = "version_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version_id = Column(UUID(as_uuid=True), ForeignKey("prompt_versions.id"), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    version = relationship("PromptVersion", back_populates="comments")
    author = relationship("Profile")
```

**Key Attributes**:

- `id`: Unique identifier (UUID)
- `version_id`: Reference to the version being commented on
- `author_id`: User who wrote the comment
- `content`: Comment text content
- `created_at`: Comment creation timestamp
- `updated_at`: Last modification timestamp

**Validation Rules**:

- Content must be non-empty
- Author must exist in profiles table
- Version must exist

## Relationships

### Prompt ↔ PromptVersion

- **Type**: One-to-Many
- **Constraint**: A prompt can have many versions, each version belongs to one prompt
- **Cascade**: Delete prompt → delete all versions

### PromptVersion ↔ VersionComment

- **Type**: One-to-Many
- **Constraint**: A version can have many comments, each comment belongs to one version
- **Cascade**: Delete version → delete all comments

### Profile ↔ Prompt

- **Type**: One-to-Many
- **Constraint**: A profile can create many prompts, each prompt has one author

### Profile ↔ PromptVersion

- **Type**: One-to-Many
- **Constraint**: A profile can create many versions, each version has one author

## Database Indexes

### Performance Indexes

```sql
-- Fast version lookups by prompt
CREATE INDEX ix_prompt_versions_prompt_id_version ON prompt_versions(prompt_id, version_number);

-- Chronological version ordering
CREATE INDEX ix_prompt_versions_created_at ON prompt_versions(created_at);

-- Author-based queries
CREATE INDEX ix_prompt_versions_author_id ON prompt_versions(author_id);

-- Active prompts lookup
CREATE INDEX ix_prompts_author_active ON prompts(author_id, is_active) WHERE is_active = true;
```

### Unique Constraints

```sql
-- Ensure unique version numbers per prompt
ALTER TABLE prompt_versions ADD CONSTRAINT uq_prompt_version_number
UNIQUE (prompt_id, version_number);
```

## Data Migration Strategy

### Existing Data

Since this is a new feature, no existing prompt data needs migration. The system will start with empty tables.

### Future Schema Changes

- Use Alembic migrations for all schema changes
- Maintain backward compatibility where possible
- Provide data migration scripts for breaking changes

## Storage Considerations

### Content Storage

- Prompt content stored as TEXT (unlimited size)
- Version content stored as TEXT (unlimited size)
- Metadata stored as JSONB for flexibility

### Performance Optimization

- Current prompt content denormalized in `prompts.content` for fast access
- Version content stored separately for historical accuracy
- JSONB metadata allows efficient querying of structured data

### Retention Policy

- Versions are immutable and preserved indefinitely
- Soft delete for prompts (is_active flag)
- Hard delete only for GDPR compliance (future requirement)

## Integration Points

### Existing Models

- **Profile**: Extended with `prompts` relationship
- **User**: No direct relationship (access through Profile)

### Authentication

- Uses existing JWT authentication system
- Author information stored via `author_id` foreign key to profiles

### File Storage

- No file storage required (text-only content)
- Future: Could integrate with existing file storage for prompt templates

## Validation Rules Summary

| Entity         | Field          | Rule                                | Error Message                     |
| -------------- | -------------- | ----------------------------------- | --------------------------------- |
| Prompt         | title          | 1-255 chars, required               | "Title must be 1-255 characters"  |
| Prompt         | content        | non-empty, required                 | "Content cannot be empty"         |
| Prompt         | author_id      | exists in profiles                  | "Author not found"                |
| PromptVersion  | version_number | positive integer, unique per prompt | "Invalid version number"          |
| PromptVersion  | content        | non-empty, required                 | "Version content cannot be empty" |
| PromptVersion  | author_id      | exists in profiles                  | "Author not found"                |
| VersionComment | content        | non-empty, required                 | "Comment cannot be empty"         |
| VersionComment | author_id      | exists in profiles                  | "Author not found"                |

## Security Considerations

### Access Control

- Prompt owners: Full access (create, read, update, delete versions)
- Other users: Read-only access to public prompts
- Admin users: Full access to all prompts

### Data Protection

- All content stored in database (no external storage)
- Audit trail maintained through version history
- Soft delete preserves data for compliance

### Input Validation

- All text inputs sanitized to prevent XSS
- Content length limits to prevent DoS attacks
- SQL injection prevention through SQLAlchemy ORM
