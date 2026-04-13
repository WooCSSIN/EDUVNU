# Giúp Django phát hiện instance Celery ngay khi khởi động Core App
from .celery import app as celery_app

__all__ = ('celery_app',)
