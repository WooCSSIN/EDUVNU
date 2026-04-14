from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, OrderItem
from courses.models import InstructorWallet, WalletTransaction, Enrollment, Notification
from decimal import Decimal

@receiver(post_save, sender=Order)
def handle_payment_success(sender, instance, **kwargs):
    """Xử lý toàn bộ hệ quả khi đơn hàng chuyển sang trạng thái 'paid'."""
    if instance.status != 'paid':
        return

    items = OrderItem.objects.filter(order=instance).select_related('course__instructor')
    course_titles = []

    for item in items:
        course = item.course
        instructor = course.instructor

        # ── 1. Tạo Enrollment cho học viên (idempotent) ──────────────────
        Enrollment.objects.get_or_create(
            user=instance.user,
            course=course,
        )

        # ── 2. Ghi sổ cái doanh thu cho giảng viên ───────────────────────
        if instructor:
            wallet, _ = InstructorWallet.objects.get_or_create(user=instructor)
            if not WalletTransaction.objects.filter(order_item=item).exists():
                amount_earned = item.price * Decimal('0.70')
                WalletTransaction.objects.create(
                    wallet=wallet,
                    amount=amount_earned,
                    transaction_type='earning',
                    description=f"Thu nhập từ học viên {instance.user.username} mua khóa '{course.title}'",
                    order_item=item
                )
                wallet.balance += amount_earned
                wallet.save()

        course_titles.append(f"'{course.title}'")

    # ── 3. Fix #3: Gửi thông báo cho học viên (người mua) ────────────────
    if course_titles:
        titles_str = ", ".join(course_titles)
        Notification.objects.create(
            user=instance.user,
            title="🎉 Thanh toán thành công!",
            message=(
                f"Đơn hàng #{instance.id} đã được xác nhận. "
                f"Bạn đã mở khóa khóa học: {titles_str}. "
                f"Chúc bạn học tập hiệu quả!"
            ),
            link=f"/cart",
        )
