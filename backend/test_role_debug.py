#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.schemas.user import UserCreate
from app.models.user import Role
import json

# Test 1: Direct enum creation
print("=== Test 1: Direct enum creation ===")
try:
    role_student = Role.STUDENT
    print(f"Role.STUDENT = {role_student}")
    print(f"Role.STUDENT.value = {role_student.value}")
    
    role_creator = Role.CREATOR
    print(f"Role.CREATOR = {role_creator}")
    print(f"Role.CREATOR.value = {role_creator.value}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Enum from string
print("\n=== Test 2: Enum from string ===")
try:
    role_from_str = Role("creator")
    print(f"Role('creator') = {role_from_str}")
    print(f"Role('creator').value = {role_from_str.value}")
except Exception as e:
    print(f"Error creating Role from 'creator': {e}")

# Test 3: UserCreate schema parsing
print("\n=== Test 3: UserCreate schema parsing ===")
try:
    user_data_dict = {
        "email": "test@example.com",
        "password": "testpass",
        "name": "Test User",
        "role": "creator"
    }
    
    user_create = UserCreate(**user_data_dict)
    print(f"UserCreate.role = {user_create.role}")
    print(f"UserCreate.role type = {type(user_create.role)}")
    print(f"UserCreate.role.value = {user_create.role.value}")
    
except Exception as e:
    print(f"Error creating UserCreate: {e}")

# Test 4: JSON parsing
print("\n=== Test 4: JSON parsing ===")
try:
    json_str = '{"email": "test@example.com", "password": "testpass", "name": "Test User", "role": "creator"}'
    user_data_dict = json.loads(json_str)
    print(f"JSON parsed role = {user_data_dict['role']}")
    
    user_create = UserCreate(**user_data_dict)
    print(f"UserCreate from JSON.role = {user_create.role}")
    print(f"UserCreate from JSON.role.value = {user_create.role.value}")
    
except Exception as e:
    print(f"Error with JSON parsing: {e}")