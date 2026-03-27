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
            
            with transaction.atomic():
                # TỰ ĐỘNG KÍCH HOẠT NẾU GIÁ BẰNG 0 (MIỄN PHÍ)
                order_status = 'paid' if total_price == 0 else 'pending'
                
                order = Order.objects.create(
                    user=request.user, 
                    total_price=total_price, 
                    payment_method=request.data.get('payment_method', 'online'), 
                    status=order_status,
                    paid_at=timezone.now() if total_price == 0 else None
                )
                
                for i in items:
                    OrderItem.objects.create(order=order, course=i.course, price=i.course.price)
                    # NẾU 0đ THÌ GHI DANH LUÔN
                    if total_price == 0:
                        Enrollment.objects.get_or_create(user=request.user, course=i.course)
                
                # XÓA GIỎ HÀNG KHI ĐÃ TẠO ORDER THÀNH CÔNG
                items.delete()
                
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
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
