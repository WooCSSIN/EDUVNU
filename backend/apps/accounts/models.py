from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Add custom fields here if needed (e.g., bio, avatar, roles)
    is_instructor = models.BooleanField(default=False)
    is_student = models.BooleanField(default=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    expertise = models.CharField(max_length=255, null=True, blank=True)
    
    # --- THÊM CÁC TRƯỜNG THEO SRS ---
    birthday = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], null=True, blank=True)
    is_email_verified = models.BooleanField(default=False, null=True, blank=True)
    # is_active (có sẵn từ AbstractUser) đóng vai trò là Locked/Unlocked
    
    def __str__(self):
        return self.username
