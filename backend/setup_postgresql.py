#!/usr/bin/env python3
"""
PostgreSQL Setup Script for Learnify Med Skillz

This script helps set up PostgreSQL database for the application.
Run this script to:
1. Create the database
2. Run migrations
3. Update environment configuration
"""

import os
import sys
import subprocess
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def update_env_file():
    """Update the environment file to use PostgreSQL."""
    env_file = Path("env")
    if env_file.exists():
        content = env_file.read_text()
        # Comment out SQLite and uncomment PostgreSQL
        content = content.replace(
            "DATABASE_URL=sqlite:///./learnify_med_skillz.db",
            "# DATABASE_URL=sqlite:///./learnify_med_skillz.db"
        )
        content = content.replace(
            "# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learnify_med_skillz",
            "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learnify_med_skillz"
        )
        env_file.write_text(content)
        print("✅ Environment file updated to use PostgreSQL")
        return True
    else:
        print("❌ Environment file not found")
        return False

def main():
    print("🚀 PostgreSQL Setup for Learnify Med Skillz")
    print("=" * 50)
    
    # Check if PostgreSQL is installed
    if not run_command("psql --version", "Checking PostgreSQL installation"):
        print("❌ PostgreSQL is not installed or not in PATH")
        print("Please install PostgreSQL first: https://www.postgresql.org/download/")
        return False
    
    # Create database (you may need to enter password)
    print("\n📝 Note: You may be prompted for the PostgreSQL password")
    if not run_command(
        'psql -U postgres -c "CREATE DATABASE learnify_med_skillz;"',
        "Creating database"
    ):
        print("⚠️  Database creation failed (it might already exist)")
    
    # Update environment file
    if not update_env_file():
        return False
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        return False
    
    # Run database migrations
    if not run_command("python init_db.py", "Initializing database tables"):
        return False
    
    print("\n🎉 PostgreSQL setup completed successfully!")
    print("You can now start the backend server with: python run.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)