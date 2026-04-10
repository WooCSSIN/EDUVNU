from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from courses.models import Category, Course

class CourseTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="CS", description="Tech")
        self.course = Course.objects.create(title="Python", description="Learn", price=19.99, category=self.category)

    def test_model_creation(self):
        self.assertEqual(self.category.name, "CS")
        self.assertEqual(self.course.title, "Python")

    def test_get_courses_list(self):
        url = reverse('course-list') 
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
