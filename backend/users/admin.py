from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'username', 'email', 'role', 'phone', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'phone')
    ordering = ('-date_joined',)

    # Add role and phone to the user edit form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('BunnyRido Fields', {
            'fields': ('role', 'phone'),
        }),
    )

    # Add role and phone to the user creation form
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('BunnyRido Fields', {
            'fields': ('role', 'phone'),
        }),
    )
