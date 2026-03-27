from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.utils import timezone
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import Cart, CartItem
from courses.models import Enrollment

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        try:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            items = CartItem.objects.filter(cart=cart).select_related('course')
            
            if not items.exists():
                return Response({'error': 'Giỏ hàng của bạn đang trống.'}, status=status.HTTP_400_BAD_REQUEST)
                
            total_price = sum(i.course.price for i in items)
            payment_method = request.data.get('payment_method', 'card')
            
            with transaction.atomic():
                order = Order.objects.create(
                    user=request.user, 
                    total_price=total_price, 
                    payment_method=payment_method, 
                    status='pending',
                )
                
                for i in items:
                    OrderItem.objects.create(order=order, course=i.course, price=i.course.price)
                
                # XÓA GIỎ HÀNG KHỎI DB
                items.delete()

            # NẾU LÀ THANH TOÁN THẺ HOẶC VNPAY => KHỞI TẠO URL VNPAY
            if payment_method in ['card', 'vnpay']:
                from .vnpay import vnpay
                vnp = vnpay()
                vnp.requestData['vnp_Version'] = '2.1.0'
                vnp.requestData['vnp_Command'] = 'pay'
                vnp.requestData['vnp_TmnCode'] = 'R8NCD1A8'
                vnp.requestData['vnp_Amount'] = int(total_price * 100)
                vnp.requestData['vnp_CurrCode'] = 'VND'
                vnp.requestData['vnp_TxnRef'] = str(order.id)
                vnp.requestData['vnp_OrderInfo'] = f'Thanh toan don hang {order.id}'
                vnp.requestData['vnp_OrderType'] = 'billpayment'
                vnp.requestData['vnp_Locale'] = 'vn'
                vnp.requestData['vnp_ReturnUrl'] = 'http://localhost:5173/payment-return'  # React Flow
                vnp.requestData['vnp_IpAddr'] = request.META.get('REMOTE_ADDR', '127.0.0.1')
                vnp.requestData['vnp_CreateDate'] = timezone.now().strftime('%Y%m%d%H%M%S')
                
                vnpay_payment_url = vnp.get_payment_url('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', 'ZKSIRYYUUBPQRBOMHXZMPEAWXYLDFWDK')
                
                return Response({'payment_url': vnpay_payment_url, 'order_id': order.id, 'status': 'pending'}, status=status.HTTP_201_CREATED)

            # NẾU LÀ CHUYỂN KHOẢN HOẶC TIỀN MẶT
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def vnpay_return(self, request):
        try:
            from .vnpay import vnpay
            vnp = vnpay()
            vnp.responseData = request.query_params.dict()
            order_id = vnp.responseData.get('vnp_TxnRef')
            vnp_ResponseCode = vnp.responseData.get('vnp_ResponseCode')

            if vnp.validate_response('ZKSIRYYUUBPQRBOMHXZMPEAWXYLDFWDK'):
                if vnp_ResponseCode == "00":
                    order = Order.objects.get(id=order_id)
                    if order.status != 'paid':
                        order.status = 'paid'
                        order.transaction_id = vnp.responseData.get('vnp_TransactionNo')
                        order.paid_at = timezone.now()
                        order.save()
                        # Ghi danh
                        for item in order.items.all():
                            Enrollment.objects.get_or_create(user=order.user, course=item.course)
                    return Response({'message': 'Thanh toán thành công. Đã kích hoạt khóa học!', 'order_id': order_id})
                else:
                    Order.objects.filter(id=order_id).update(status='cancelled')
                    return Response({'error': 'Giao dịch bị hủy hoặc không thành công!', 'order_id': order_id}, status=400)
            else:
                return Response({'error': 'Sai chữ ký bảo mật VNPAY!'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        order = self.get_object()
        transaction_id = request.data.get('transaction_id', 'ONLINE_PAYMENT')
        
        with transaction.atomic():
            order.status = 'paid'
            order.transaction_id = transaction_id
            order.paid_at = timezone.now()
            order.save()
            
            for item in order.items.all():
                Enrollment.objects.get_or_create(user=order.user, course=item.course)
                
        return Response({'message': 'Thanh toán thành công!'}, status=status.HTTP_200_OK)
