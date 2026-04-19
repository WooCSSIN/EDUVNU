from rest_framework import serializers
from .models import (
    Category, Course, Lesson, Enrollment, UserProgress, Review, ContactMessage,
    Chapter, Quiz, Question, Choice, Notification, LessonComment, QuizAttempt,
    News, FAQ, Wishlist
)
from accounts.models import User


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order_number', 'video_url', 'document_file', 'content', 'course']

class LessonCommentSerializer(serializers.ModelSerializer):
    user = InstructorSerializer(read_only=True)
    class Meta:
        model = LessonComment
        fields = ['id', 'user', 'content', 'created_at']

class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'quiz', 'score', 'passed', 'draft_answers', 'is_submitted', 'attempted_at']


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'choices']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'passing_score', 'questions']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'link', 'created_at']


class ChapterSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    quiz = QuizSerializer(read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'title', 'order', 'lessons', 'quiz']


class CourseSerializer(serializers.ModelSerializer):
    instructor = InstructorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    lesson_count = serializers.SerializerMethodField()
    skills_list = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['instructor', 'rating_avg', 'num_reviews', 'is_active', 'created_at']

    def get_lesson_count(self, obj):
        return obj.lessons.filter(is_active=True).count()

    def get_skills_list(self, obj):
        if not obj.skills:
            return []
        return [s.strip() for s in obj.skills.split(',') if s.strip()][:6]


class CourseDetailSerializer(CourseSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'enrolled_at']


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = ['id', 'lesson', 'status', 'last_accessed']


class ReviewSerializer(serializers.ModelSerializer):
    user = InstructorSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'course', 'rating', 'comment', 'instructor_reply',
                  'replied_at', 'created_at', 'can_edit']
        read_only_fields = ['user', 'instructor_reply', 'replied_at', 'created_at']

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_id == request.user.id
        return False


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class NewsSerializer(serializers.ModelSerializer):
    author_name = serializers.StringRelatedField(source='author', read_only=True)
    
    class Meta:
        model = News
        fields = '__all__'

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'

from .models import DegreeProgram

class DegreeProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = DegreeProgram
        fields = '__all__'


class WishlistSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'course', 'added_at']
