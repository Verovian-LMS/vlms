"""
Add document_url column to lessons

Revision ID: 20251103_add_document_url_to_lessons
Revises: 
Create Date: 2025-11-03
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_doc_url_20251103'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add document_url TEXT column if it does not already exist (idempotent)
    op.execute("ALTER TABLE lessons ADD COLUMN IF NOT EXISTS document_url TEXT")


def downgrade():
    # Drop document_url column if it exists
    op.execute("ALTER TABLE lessons DROP COLUMN IF EXISTS document_url")