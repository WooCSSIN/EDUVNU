from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import Cart, CartItem
from courses.models import Enrollment


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Gio hang trong.'}, status=status.HTTP_400_BAD_REQUEST)
        items = CartItem.objects.filter(cart=cart).select_related('course')
        if not items.exists():
            return Response({'error': 'Gio hang trong.'}, status=status.HTTP_400_BAD_REQUEST)
        already_enrolled = Enrollment.objects.filter(user=request.user, course__in=[i.course for i in items]).values_list('course_id', flat=True)
        new_items = [i for i in items if i.course_id not in already_enrolled]
        if not new_items:
            return Response({'error': 'Ban da mua tat ca khoa hoc.'}, status=status.HTTP_400_BAD_REQUEST)
        total_price = sum(i.course.price for i in new_items)
        with transaction.atomic():
            order = Order.objects.create(user=request.user, total_price=total_price, payment_method=request.data.get('payment_method', 'online'), status='paid')
            for i in new_items:
                OrderItem.objects.create(order=order, course=i.course, price=i.course.price)
                Enrollment.objects.get_or_create(user=request.user, course=i.course)
            CartItem.objects.filter(cart=cart).delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
