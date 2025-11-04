#!/usr/bin/env python3
"""
Database initialization script
"""
from app.core.database import engine, Base
from app.models import *  # Import all models
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_tables():
    """Create all database tables."""
    logger.info("Creating database tables...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    logger.info("Database tables created successfully!")


def init_db():
    """Initialize the database."""
    try:
        create_tables()
        logger.info("Database initialization completed!")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise


if __name__ == "__main__":
    init_db()
