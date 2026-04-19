from django.contrib import admin
from .models import (
    Category, Course, Chapter, Lesson, Enrollment, UserProgress,
    Review, Certificate, Notification, ContactMessage,
    FAQ, News, DegreeProgram, Wishlist,
    InstructorWallet, WalletTransaction, WithdrawalRequest,
    Quiz, Question, Choice, QuizAttempt, LessonComment, CourseAnnouncement,
)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active',)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'category', 'price', 'status', 'rating_avg', 'num_reviews', 'is_active')
    list_filter = ('category', 'status', 'is_active', 'level')
    search_fields = ('title', 'instructor__username', 'partner_name', 'subject_code')
    readonly_fields = ('rating_avg', 'num_reviews')

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'chapter', 'order_number', 'is_active')
    list_filter = ('course', 'is_active')
    search_fields = ('title', 'course__title')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'degree_program', 'enrolled_at')
    list_filter = ('course',)
    search_fields = ('user__username', 'course__title')
    readonly_fields = ('enrolled_at',)

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'status', 'time_spent', 'last_accessed')
    list_filter = ('status',)
    search_fields = ('user__username', 'lesson__title')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'rating', 'created_at', 'has_reply')
    list_filter = ('rating', 'course')
    search_fields = ('user__username', 'course__title', 'comment')
    readonly_fields = ('created_at',)
    def has_reply(self, obj):
        return bool(obj.instructor_reply)
    has_reply.boolean = True
    has_reply.short_description = 'Đã phản hồi'

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_id', 'get_student', 'get_course', 'issued_at')
    search_fields = ('certificate_id', 'enrollment__user__username', 'enrollment__course__title')
    readonly_fields = ('certificate_id', 'issued_at')
    def get_student(self, obj):
        return obj.enrollment.user.username
    get_student.short_description = 'Học viên'
    def get_course(self, obj):
        return obj.enrollment.course.title if obj.enrollment.course else '—'
    get_course.short_description = 'Khóa học'

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_read', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('user__username', 'title')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at')
    search_fields = ('name', 'email', 'subject')
    readonly_fields = ('created_at',)

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('question', 'answer')
    ordering = ('order',)

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'is_published', 'created_at')
    list_filter = ('is_published',)
    search_fields = ('title',)

@admin.register(DegreeProgram)
class DegreeProgramAdmin(admin.ModelAdmin):
    list_display = ('title', 'school', 'level', 'subject', 'is_active')
    list_filter = ('level', 'subject', 'school', 'is_active')
    search_fields = ('title', 'school', 'instructor')

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'added_at')
    list_filter = ('course',)
    search_fields = ('user__username', 'course__title')
    readonly_fields = ('added_at',)

@admin.register(InstructorWallet)
class InstructorWalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'bank_name', 'account_number')
    search_fields = ('user__username',)

@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'amount', 'transaction_type', 'created_at')
    list_filter = ('transaction_type',)

@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user__username',)

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'chapter', 'passing_score')
    search_fields = ('title',)

@admin.register(LessonComment)
class LessonCommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'created_at')
    search_fields = ('user__username', 'lesson__title')

@admin.register(CourseAnnouncement)
class CourseAnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'created_at')
    search_fields = ('title', 'course__title')

