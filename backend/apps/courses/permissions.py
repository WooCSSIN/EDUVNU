from rest_framework import permissions

class IsInstructor(permissions.BasePermission):
    """
    Chỉ cho phép người dùng có quyền is_instructor truy cập.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_instructor)

class IsCourseOwner(permissions.BasePermission):
    """
    Chỉ cho phép giảng viên sở hữu khóa học mới có quyền thao tác.
    """
    def has_object_permission(self, request, view, obj):
        # Kiểm tra xem khóa học có thuộc về giảng viên đang đăng nhập không
        return obj.instructor == request.user
