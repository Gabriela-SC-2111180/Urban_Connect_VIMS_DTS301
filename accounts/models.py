from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Custom user model for VIMS. 
    # Login is by email and every user has one role already assigned to them,
    # which decides what dashboard they're sent to after logging in. 
    # Accounts are created by the system administrator only.
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'System Administrator'
        PROGRAMME_COORDINATOR = 'PROGRAMME_COORDINATOR', 'Programme Coordinator'
        OPERATIONS = 'OPERATIONS', 'Operations Manager'
        FUNDER_RELATIONS = 'FUNDER_RELATIONS', 'Funder-Relations Manager'
        VOLUNTEER_COORDINATOR = 'VOLUNTEER_COORDINATOR', 'Volunteer Coordinator'

    email = models.EmailField(max_length=254, unique=True)
    role = models.CharField(max_length=25, choices=Role.choices, default=Role.VOLUNTEER_COORDINATOR)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
    
    def save(self, *args, **kwargs):
        # Django superuser by default has the ADMIN role.
        if self.is_superuser:
            self.role = self.Role.ADMIN
        # Anyone having the ADMIN role must also be Django staff.
        if self.role == self.Role.ADMIN:
            self.is_staff = True
        super().save(*args, **kwargs)