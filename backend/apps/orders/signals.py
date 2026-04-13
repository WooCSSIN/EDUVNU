from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order, OrderItem
from courses.models import InstructorWallet, WalletTransaction
from decimal import Decimal

@receiver(post_save, sender=Order)
def handle_payment_success(sender, instance, **kwargs):
    # LOGIC: Chỉ xử lý khi đơn hàng vừa được thanh toán xong
    if instance.status == 'paid':
        items = OrderItem.objects.filter(order=instance)
        
        for item in items:
            instructor = item.course.instructor
            if not instructor:
                continue
                
            # 1. Lấy hoặc tạo ví cho giảng viên
            wallet, _ = InstructorWallet.objects.get_or_create(user=instructor)
            
            # 2. Kiểm tra xem giao dịch này đã được ghi sổ chưa (Tránh cộng tiền 2 lần)
            if not WalletTransaction.objects.filter(order_item=item).exists():
                amount_earned = item.price * Decimal('0.70')
                
                # 3. Tạo dòng giao dịch trong Sổ cái
                WalletTransaction.objects.create(
                    wallet=wallet,
                    amount=amount_earned,
                    transaction_type='earning',
                    description=f"Thu nhập từ học viên {instance.user.username} mua khóa {item.course.title}",
                    order_item=item
                )
                
                # 4. Cập nhật số dư cuối cùng trong ví
                wallet.balance += amount_earned
                wallet.save()
                print(f">>> Da cong {amount_earned} VND vao vi cua {instructor.username}")
