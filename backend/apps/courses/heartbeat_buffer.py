"""
Heartbeat Buffer Module — Giảm áp lực DB cho tính năng tracking thời gian học.

Thay vì mỗi heartbeat (30s/user) ghi trực tiếp vào DB, module này:
1. Gom lại vào dict trong memory
2. Flush batch vào DB mỗi FLUSH_INTERVAL giây (mặc định 300s = 5 phút)

Trade-off: Nếu server restart, mất tối đa 5 phút data tracking (acceptable).
"""

import threading
import time
import logging
import atexit

logger = logging.getLogger(__name__)

# Cấu hình
FLUSH_INTERVAL = 300  # Flush mỗi 5 phút (giây)

# In-memory buffer: key = (user_id, lesson_id), value = seconds tích lũy
_buffer = {}
_lock = threading.Lock()
_flusher_started = False


def add_heartbeat(user_id, lesson_id, seconds):
    """Cộng dồn thời gian vào buffer (thread-safe). Không chạm DB."""
    if seconds <= 0 or seconds > 60:
        return
    key = (user_id, lesson_id)
    with _lock:
        _buffer[key] = _buffer.get(key, 0) + seconds


def flush_to_db():
    """Ghi toàn bộ buffer vào DB trong 1 batch, rồi xóa buffer."""
    from courses.models import UserProgress

    with _lock:
        if not _buffer:
            return
        snapshot = dict(_buffer)
        _buffer.clear()

    updated_count = 0
    for (user_id, lesson_id), seconds in snapshot.items():
        try:
            rows = UserProgress.objects.filter(
                user_id=user_id, lesson_id=lesson_id
            ).update(
                time_spent=models_F('time_spent') + seconds
            )
            if rows == 0:
                # Chưa có record → tạo mới
                UserProgress.objects.get_or_create(
                    user_id=user_id, lesson_id=lesson_id,
                    defaults={'status': 'learning', 'time_spent': seconds}
                )
            updated_count += 1
        except Exception as e:
            logger.error(f"Heartbeat flush error for user={user_id}, lesson={lesson_id}: {e}")

    if updated_count > 0:
        logger.info(f"[HeartbeatBuffer] Flushed {updated_count} records to DB")


def models_F(field_name):
    """Helper import để tránh circular import khi module load."""
    from django.db.models import F
    return F(field_name)


def _flusher_loop():
    """Background thread: chạy flush_to_db() định kỳ."""
    while True:
        time.sleep(FLUSH_INTERVAL)
        try:
            flush_to_db()
        except Exception as e:
            logger.error(f"[HeartbeatBuffer] Flush loop error: {e}")


def start_flusher():
    """Khởi động background flusher thread (chỉ chạy 1 lần)."""
    global _flusher_started
    if _flusher_started:
        return
    _flusher_started = True
    t = threading.Thread(target=_flusher_loop, daemon=True, name="heartbeat-flusher")
    t.start()
    atexit.register(flush_to_db)  # Flush buffer trước khi server dừng
    logger.info(f"[HeartbeatBuffer] Background flusher started (interval={FLUSH_INTERVAL}s)")
