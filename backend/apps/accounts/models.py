from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Add custom fields here if needed (e.g., bio, avatar, roles)
    is_instructor = models.BooleanField(default=False)
    is_student = models.BooleanField(default=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    expertise = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return self.username
