from celery import shared_task
from celery.utils.log import get_task_logger
from .heartbeat_buffer import flush_to_db

logger = get_task_logger(__name__)

@shared_task
def flush_heartbeat_buffer_task():
    """
    Celery Beat sẽ tự động gọi task này mỗi 5 phút.
    Nó thực thi hàm flush_to_db() trong heartbeat_buffer.py,
    đảm bảo dữ liệu từ memory buffer luôn được chốt xuống DB an toàn.
    """
    try:
        flush_to_db()
        logger.info("Hoàn tất flush heartbeat buffer vào Database thành công bằng Celery Task.")
        return "Flushed heartbeat buffer successfully."
    except Exception as e:
        logger.error(f"Lỗi khi Celery flush heartbeat buffer: {e}")
        return f"Error: {e}"
