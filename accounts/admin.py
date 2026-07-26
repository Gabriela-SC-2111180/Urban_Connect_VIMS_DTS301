from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User

# Django's built-in admin interface.
# The only area from where user accounts can be created and managed by the system administrator.
@admin.register(User)
class VIMSUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'is_active')
    fieldsets = UserAdmin.fieldsets + (('VIMS role', {'fields': ('role',)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (('VIMS role', {'fields': ('role', 'email')}),)