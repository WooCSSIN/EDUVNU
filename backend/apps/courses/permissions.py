from rest_framework import permissions

class IsInstructor(permissions.BasePermission):
    """
    Cho phép người dùng có quyền is_instructor hoặc is_staff truy cập.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_instructor or request.user.is_staff))

class IsCourseOwner(permissions.BasePermission):
    """
    Cho phép giảng viên sở hữu khóa học thao tác, hoặc nếu là quản trị viên/staff (is_staff).
    """
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_staff:
            return True
        return obj.instructor == request.user
