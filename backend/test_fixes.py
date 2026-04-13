import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.db import connection
from django.test.utils import CaptureQueriesContext

User = get_user_model()
client = APIClient()

user = User.objects.filter(username='aaa').first()
if not user:
    user = User.objects.first()

if user:
    client.force_authenticate(user=user)

print("="*50)
print("1. TEST SQL-LEVEL DEDUP (Reduced Queries)")
print("="*50)
with CaptureQueriesContext(connection) as ctx:
    res = client.get('/api/v1/courses/categories/')
print(f"API /categories/: Status {res.status_code}. Query Count: {len(ctx)}")

with CaptureQueriesContext(connection) as ctx:
    res = client.get('/api/v1/courses/instructor-courses/my_students/')
print(f"API /instructor/students/: Status {res.status_code}. Query Count: {len(ctx)}")

with CaptureQueriesContext(connection) as ctx:
    res = client.get('/api/v1/courses/instructor-courses/detailed_analytics/')
print(f"API /instructor/analytics/: Status {res.status_code}. Query Count: {len(ctx)}")

print("\n" + "="*50)
print("2. TEST HEARTBEAT BUFFER (Batching DB Writes)")
print("="*50)
from courses.models import Lesson, UserProgress
from courses.heartbeat_buffer import _buffer, flush_to_db

lesson = Lesson.objects.filter(is_active=True).first()
if lesson and user:
    initial_time = UserProgress.objects.filter(user=user, lesson=lesson).values_list('time_spent', flat=True).first() or 0
    print(f"Initial DB time_spent: {initial_time} seconds")
    print("Sending 5 heartbeat requests (30s each)...")
    
    for i in range(5):
        client.post('/api/v1/courses/progress/heartbeat/', {'lesson_id': lesson.id, 'seconds': 30}, content_type='application/json')
    
    buffer_val = _buffer.get((user.id, lesson.id), 0)
    print(f"Current Memory Buffer Value: {buffer_val} seconds")
    
    db_time_before = UserProgress.objects.filter(user=user, lesson=lesson).values_list('time_spent', flat=True).first() or 0
    print(f"DB time_spent BEFORE target flush: {db_time_before} seconds (Unchanged)")
    
    print("Triggering flush_to_db() background flush...")
    flush_to_db()
    
    db_time_after = UserProgress.objects.filter(user=user, lesson=lesson).values_list('time_spent', flat=True).first() or 0
    print(f"DB time_spent AFTER flush: {db_time_after} seconds")
else:
    print("No user or lesson found to test heartbeat.")

print("\n" + "="*50)
print("3. TEST QR RATE LIMIT (Anti brute-force)")
print("="*50)
import uuid
anon_client = APIClient()
fake_uuid = str(uuid.uuid4())
print(f"Sending 13 requests to verify endpoint for a fake UUID: {fake_uuid}")

status_codes = []
for i in range(13):
    res = anon_client.get(f'/api/v1/courses/certificates/verify/{fake_uuid}/')
    status_codes.append(res.status_code)

print("Received HTTP Status Codes:")
for i, code in enumerate(status_codes):
    if code == 429:
        print(f"  - Request {i+1}: {code} (Too Many Requests - BLOCKED BY RATE LIMITER!)")
    else:
        print(f"  - Request {i+1}: {code} (Not Found - Processed Normally)")

print("\nTest completed.")
