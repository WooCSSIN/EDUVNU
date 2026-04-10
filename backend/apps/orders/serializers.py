from rest_framework import serializers
from .models import Order, OrderItem
from courses.serializers import CourseSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'course', 'course_id', 'price']
        read_only_fields = ['order', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'payment_method', 'transaction_id', 'paid_at', 'status', 'created_at', 'items']
        read_only_fields = ['user', 'total_price', 'status', 'paid_at', 'created_at']
