import os
from celery import Celery
from celery.schedules import crontab

# Set default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')

# Đọc cấu hình Celery từ chuẩn settings files của Django (bắt đầu bằng ký tự CELERY_)
app.config_from_object('django.conf:settings', namespace='CELERY')

# Tự động scan và load file tasks.py từ tất cả các INSTALLED_APPS (như apps.courses.tasks)
app.autodiscover_tasks()

# Celery Beat config: Chạy hàm xả (flush) Heartbeat buffer vào DB mỗi 5 phút
app.conf.beat_schedule = {
    'flush-heartbeats-every-5-minutes': {
        'task': 'courses.tasks.flush_heartbeat_buffer_task',
        'schedule': crontab(minute='*/5'),
    },
}
