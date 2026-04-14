from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import Cart, CartItem
from courses.models import Enrollment
import re


def _clear_cart(order):
    """Helper: Xóa các khóa học đã thanh toán khỏi giỏ hàng."""
    try:
        cart = Cart.objects.get(user=order.user)
        course_ids = order.items.values_list('course_id', flat=True)
        CartItem.objects.filter(cart=cart, course_id__in=course_ids).delete()
    except Cart.DoesNotExist:
        pass

def _activate_enrollment(order):
    """Helper: Kích hoạt khóa học sau khi thanh toán thành công."""
    for item in order.items.all():
        Enrollment.objects.get_or_create(user=order.user, course=item.course)
    _clear_cart(order)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    # =========================================================
    # CHECKOUT: Tạo đơn hàng & tạo link thanh toán
    # =========================================================
    @action(detail=False, methods=['post'])
    def checkout(self, request):
        if not request.user.is_active:
            return Response({'error': 'Tài khoản của bạn đang bị khóa, không thể thanh toán.'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            items = CartItem.objects.filter(cart=cart).select_related('course')

            if not items.exists():
                return Response({'error': 'Giỏ hàng của bạn đang trống.'}, status=status.HTTP_400_BAD_REQUEST)

            total_price = sum(i.course.price for i in items)
            payment_method = request.data.get('payment_method', 'vnpay')

            with transaction.atomic():
                order = Order.objects.create(
                    user=request.user,
                    total_price=total_price,
                    payment_method=payment_method,
                    status='pending',
                )
                for i in items:
                    OrderItem.objects.create(order=order, course=i.course, price=i.course.price)
                # items.delete() - REMOVED: Will be deleted when payment is confirmed

            # ── OOP PAYMENT STRATEGY ───────────────────────────
            from .payments.factory import PaymentFactory
            try:
                provider = PaymentFactory.get_provider(payment_method)
                result = provider.create_payment(order, request)
                
                if 'error' in result:
                    return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
                
                # Update order if paid immediately (Stripe succeeded)
                if result.get('status') == 'success':
                    order.status = 'paid'
                    order.transaction_id = result.get('transaction_id')
                    order.paid_at = timezone.now()
                    order.save()
                    _activate_enrollment(order)
                    return Response({'status': 'success', 'order_id': order.id}, status=status.HTTP_201_CREATED)
                
                return Response(result, status=status.HTTP_201_CREATED)
                
            except ValueError as e:
                # Handle non-refactored methods or unsupported methods
                if payment_method == 'momo':
                    from .momo_payment import MoMoPayment
                    momo = MoMoPayment()
                    momo_url = momo.create_payment_url(str(order.id), int(total_price), f'Thanh toan EduVNU {order.id}')
                    return Response({'payment_url': momo_url, 'order_id': order.id}, status=status.HTTP_201_CREATED)
                
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # =========================================================
    # VNPAY RETURN: Xử lý kết quả VNPAY redirect về Frontend
    # =========================================================
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def vnpay_return(self, request):
        """
        VNPAY redirect khách hàng về đây sau khi thanh toán.
        Xác thực checksum, cập nhật DB, kích hoạt khóa học.
        """
        from .vnpay import vnpay as VnpayHelper
        vnp = VnpayHelper()
        vnp.responseData = request.GET.dict()

        order_id = request.GET.get('vnp_TxnRef')
        response_code = request.GET.get('vnp_ResponseCode')
        transaction_no = request.GET.get('vnp_TransactionNo', '')
        amount = int(request.GET.get('vnp_Amount', 0)) // 100  # Chuyển về VND

        # Bước 1: Xác thực chữ ký bảo mật (QUAN TRỌNG - chống giả mạo)
        is_valid = vnp.validate_response(settings.VNPAY_HASH_SECRET)
        if not is_valid:
            return Response({
                'status': 'error',
                'message': 'Xác thực chữ ký thất bại! Giao dịch có thể bị giả mạo.',
                'order_id': order_id,
            }, status=status.HTTP_400_BAD_REQUEST)

        # Bước 2: Kiểm tra mã phản hồi từ VNPAY
        if response_code != '00':
            vnpay_errors = {
                '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ.',
                '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking.',
                '10': 'Xác thực thông tin thẻ quá 3 lần.',
                '11': 'Giao dịch đã hết hạn thanh toán.',
                '12': 'Thẻ/Tài khoản bị khóa.',
                '13': 'Sai mật khẩu OTP.',
                '24': 'Khách hàng hủy giao dịch.',
                '51': 'Tài khoản không đủ số dư.',
                '65': 'Tài khoản vượt hạn mức giao dịch trong ngày.',
                '75': 'Ngân hàng thanh toán đang bảo trì.',
                '79': 'Nhập sai mật khẩu thanh toán nhiều lần.',
            }
            error_msg = vnpay_errors.get(response_code, f'Giao dịch thất bại (Mã lỗi: {response_code})')
            return Response({
                'status': 'error',
                'message': error_msg,
                'order_id': order_id,
                'response_code': response_code,
            }, status=status.HTTP_400_BAD_REQUEST)

        # Bước 3: Cập nhật DB
        try:
            order = Order.objects.get(id=order_id)
            if order.status != 'paid':
                order.status = 'paid'
                order.transaction_id = transaction_no
                order.paid_at = timezone.now()
                order.save()
                _activate_enrollment(order)
                print(f"[SUCCESS] VNPAY Return: Order #{order_id} payment success - VNPAY Trans #{transaction_no}")

            return Response({
                'status': 'success',
                'message': 'Thanh toán VNPAY thành công! Khóa học đã được kích hoạt.',
                'order_id': order_id,
                'transaction_no': transaction_no,
                'amount': amount,
            })
        except Order.DoesNotExist:
            return Response({'status': 'error', 'message': 'Không tìm thấy đơn hàng.'}, status=status.HTTP_404_NOT_FOUND)

    # =========================================================
    # VNPAY IPN: VNPAY gọi Server-to-Server (Không qua trình duyệt)
    # =========================================================
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def vnpay_ipn(self, request):
        """
        VNPAY IPN (Instant Payment Notification)
        VNPAY tự động gọi endpoint này ngầm từ server của họ,
        độc lập với việc khách có đóng trình duyệt hay không.
        Đây là cơ chế đảm bảo 100% đơn hàng được xác nhận.
        """
        from .vnpay import vnpay as VnpayHelper
        vnp = VnpayHelper()
        vnp.responseData = request.GET.dict()

        order_id = request.GET.get('vnp_TxnRef')
        response_code = request.GET.get('vnp_ResponseCode')
        transaction_no = request.GET.get('vnp_TransactionNo', '')
        vnp_amount = int(request.GET.get('vnp_Amount', 0))

        # Bước 1: Xác thực chữ ký
        if not vnp.validate_response(settings.VNPAY_HASH_SECRET):
            print(f"[ERROR] VNPAY IPN: Invalid checksum for order #{order_id}")
            return Response({'RspCode': '97', 'Message': 'Invalid Signature'})

        try:
            order = Order.objects.get(id=order_id)

            # Bước 2: Kiểm tra số tiền có khớp không
            expected_amount = int(order.total_price) * 100
            if vnp_amount != expected_amount:
                print(f"[ERROR] VNPAY IPN: Price mismatch for order #{order_id}: expected {expected_amount}, got {vnp_amount}")
                return Response({'RspCode': '04', 'Message': 'Invalid Amount'})

            # Bước 3: Kiểm tra đơn hàng đã xử lý chưa
            if order.status == 'paid':
                return Response({'RspCode': '02', 'Message': 'Order Already Confirmed'})

            # Bước 4: Cập nhật đơn hàng
            if response_code == '00':
                order.status = 'paid'
                order.transaction_id = transaction_no
                order.paid_at = timezone.now()
                order.save()
                _activate_enrollment(order)
                print(f"[SUCCESS] VNPAY IPN: Order #{order_id} confirmed via IPN")
                return Response({'RspCode': '00', 'Message': 'Confirm Success'})
            else:
                order.status = 'failed'
                order.save()
                print(f"[WARNING] VNPAY IPN: Transaction failed for order #{order_id} - Code: {response_code}")
                return Response({'RspCode': '00', 'Message': 'Confirm Success'})

        except Order.DoesNotExist:
            print(f"[ERROR] VNPAY IPN: Order not found #{order_id}")
            return Response({'RspCode': '01', 'Message': 'Order Not Found'})

    # =========================================================
    # MOMO RETURN & IPN
    # =========================================================
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def momo_return(self, request):
        order_id = request.GET.get('orderId')
        result_code = request.GET.get('resultCode')
        if result_code == '0':
            try:
                order = Order.objects.get(id=order_id)
                if order.status != 'paid':
                    order.status = 'paid'
                    order.save()
                    _activate_enrollment(order)
                return Response({'status': 'success', 'message': 'Thanh toán MoMo thành công!', 'order_id': order_id})
            except Order.DoesNotExist:
                return Response({'status': 'error', 'message': 'Không tìm thấy đơn hàng.'})
        return Response({'status': 'error', 'message': 'Thanh toán MoMo thất bại.', 'order_id': order_id})

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def momo_ipn(self, request):
        order_id = request.data.get('orderId')
        result_code = request.data.get('resultCode')
        if result_code == 0:
            try:
                order = Order.objects.get(id=order_id)
                if order.status != 'paid':
                    order.status = 'paid'
                    order.save()
                    _activate_enrollment(order)
            except Order.DoesNotExist:
                pass
        return Response(status=status.HTTP_204_NO_CONTENT)

    # =========================================================
    # SEPAY WEBHOOK
    # =========================================================
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def sepay_webhook(self, request):
        """SePay tự động gọi khi có tiền vào tài khoản ngân hàng."""
        try:
            content = request.data.get('content', '')
            match = re.search(r'SEVQR\s*(\d+)', content, re.IGNORECASE)
            if match:
                order_id = match.group(1)
                try:
                    order = Order.objects.get(id=order_id)
                    if order.status != 'paid':
                        order.status = 'paid'
                        order.transaction_id = str(request.data.get('id', ''))
                        order.paid_at = timezone.now()
                        order.save()
                        _activate_enrollment(order)
                        print(f"[SUCCESS] SePay Webhook: Order #{order_id} payment success")
                    return Response({'success': True})
                except Order.DoesNotExist:
                    return Response({'success': False, 'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'success': False, 'error': 'Invalid content syntax'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # =========================================================
    # CONFIRM PAYMENT (Admin thủ công)
    # =========================================================
    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        order = self.get_object()
        transaction_id = request.data.get('transaction_id', 'MANUAL_CONFIRM')
        with transaction.atomic():
            order.status = 'paid'
            order.transaction_id = transaction_id
            order.paid_at = timezone.now()
            order.save()
            _activate_enrollment(order)
        return Response({'message': 'Xác nhận thanh toán thủ công thành công!'}, status=status.HTTP_200_OK)
