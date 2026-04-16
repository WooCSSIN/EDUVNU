from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, CourseViewSet, LessonViewSet, 
    UserProgressViewSet, ReviewViewSet, ContactMessageViewSet,
    InstructorCourseViewSet, ChapterViewSet,
    QuizViewSet, QuestionViewSet, ChoiceViewSet,
    AdminCourseViewSet, NotificationViewSet,
    CertificateVerifyView, LessonCommentViewSet,
    NewsViewSet, FAQViewSet, DegreeProgramViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'chapters', ChapterViewSet)
router.register(r'quizzes', QuizViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'choices', ChoiceViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'admin-courses', AdminCourseViewSet, basename='admin-courses')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'lessons', LessonViewSet)
router.register(r'progress', UserProgressViewSet, basename='progress')
router.register(r'reviews', ReviewViewSet)
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'instructor-courses', InstructorCourseViewSet, basename='instructor-courses')
router.register(r'lesson-comments', LessonCommentViewSet, basename='lesson-comments')
router.register(r'news', NewsViewSet, basename='news')
router.register(r'faqs', FAQViewSet, basename='faqs')
router.register(r'degree-programs', DegreeProgramViewSet, basename='degree-programs')

urlpatterns = [
    path('', include(router.urls)),
    path('certificates/verify/<uuid:certificate_uuid>/', CertificateVerifyView.as_view(), name='certificate-verify'),
]
