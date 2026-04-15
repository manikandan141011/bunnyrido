from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'trip', 'total_amount', 'status',
                    'passenger_name', 'booked_at')
    list_filter = ('status', 'booked_at')
    search_fields = ('user__username', 'user__email', 'passenger_name',
                     'passenger_email', 'trip__route__source',
                     'trip__route__destination')
    ordering = ('-booked_at',)
    readonly_fields = ('booked_at',)
    filter_horizontal = ('seats',)
