from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from courses.models import Course, Category

class CartTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='cartuser', password='ComplexPassword123!', email='cart@example.com')
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name="Tech", description="Tech")
        self.course = Course.objects.create(title="Django", description="Learn", price=15.00, category=self.category)
        self.add_item_url = reverse('cart-add-item')

    def test_add_item_to_cart(self):
        response = self.client.post(self.add_item_url, {'course_id': self.course.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
