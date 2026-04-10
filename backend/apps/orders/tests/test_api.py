from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from courses.models import Course, Category
from orders.models import Order

class OrderTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='orderuser', 
            password='ComplexPassword123!',
            email='order@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = Category.objects.create(name="Business", description="Biz")
        self.course = Course.objects.create(
            title="Business 101",
            description="Biz basics.",
            price=0.00,
            category=self.category
        )
        
        self.order_list_url = reverse('order-list')

    def test_get_orders_empty(self):
        """Test listing orders for a new user."""
        response = self.client.get(self.order_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
