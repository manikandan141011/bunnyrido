from django.contrib import admin
from .models import Bus, Route


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'bus_type', 'total_seats', 'registration_number', 'is_active')
    list_filter = ('bus_type', 'is_active')
    search_fields = ('name', 'registration_number')
    ordering = ('-created_at',)


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('id', 'source', 'destination', 'distance_km', 'duration_hours', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('source', 'destination')
    ordering = ('source',)
