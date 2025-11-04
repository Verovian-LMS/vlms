#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.user import Profile, Role
from app.core.database import SessionLocal
import uuid

# Test direct Profile creation
print("=== Test 1: Direct Profile creation ===")
try:
    profile = Profile(
        id=uuid.uuid4(),
        name="Test Creator",
        email="test@example.com",
        role=Role.CREATOR
    )
    print(f"Profile created with role = {profile.role}")
    print(f"Profile.role type = {type(profile.role)}")
    print(f"Profile.role.value = {profile.role.value}")
    
    # Test database insertion
    print("\n=== Test 2: Database insertion ===")
    db = SessionLocal()
    try:
        db.add(profile)
        db.flush()
        print(f"After flush, profile.role = {profile.role}")
        print(f"After flush, profile.role.value = {profile.role.value}")
        db.rollback()  # Don't actually commit
        print("Database test completed (rolled back)")
    except Exception as e:
        print(f"Database error: {e}")
        db.rollback()
    finally:
        db.close()
        
except Exception as e:
    print(f"Error: {e}")

# Test enum from string
print("\n=== Test 3: Role from string ===")
try:
    role_creator = Role("creator")
    print(f"Role('creator') = {role_creator}")
    print(f"Role('creator').value = {role_creator.value}")
    print(f"Role('creator').name = {role_creator.name}")
except Exception as e:
    print(f"Error: {e}")