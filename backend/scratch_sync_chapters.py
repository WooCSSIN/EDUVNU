from courses.models import Course, Chapter, Lesson

courses = Course.objects.all()
print(f"Dang sync {courses.count()} khoa hoc...")
for c in courses:
    chapter, created = Chapter.objects.get_or_create(
        course=c, 
        title='Chương 1: Giới thiệu & Khái quát', 
        defaults={'order': 1}
    )

    lessons = Lesson.objects.filter(course=c, chapter__isnull=True)
    count = lessons.update(chapter=chapter)
    if count > 0:
        print(f"- Da chuyen {count} bai hoc vao Chuong 1 cho khoa: {c.title}")
print("Sync xong!")
