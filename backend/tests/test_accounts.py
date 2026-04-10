from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User

class AuthTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'ComplexPassword123!',
            'password2': 'ComplexPassword123!',
        }

    def test_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_login(self):
        User.objects.create_user(username='testuser', password='ComplexPassword123!', email='test@example.com')
        response = self.client.post(self.login_url, {'username': 'testuser', 'password': 'ComplexPassword123!'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
