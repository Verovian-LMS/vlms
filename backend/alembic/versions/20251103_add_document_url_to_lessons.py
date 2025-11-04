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
    # Add document_url TEXT column, nullable
    op.add_column('lessons', sa.Column('document_url', sa.Text(), nullable=True))


def downgrade():
    # Drop document_url column
    op.drop_column('lessons', 'document_url')