from django.contrib import admin
from .models import Trip, Seat


class SeatInline(admin.TabularInline):
    model = Seat
    extra = 0
    readonly_fields = ('seat_number', 'is_booked')
    can_delete = False


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('id', 'route', 'bus', 'departure_time', 'arrival_time',
                    'price', 'status', 'available_seats_count')
    list_filter = ('status', 'departure_time', 'bus__bus_type')
    search_fields = ('route__source', 'route__destination', 'bus__name')
    ordering = ('-departure_time',)
    inlines = [SeatInline]

    def available_seats_count(self, obj):
        return obj.available_seats_count
    available_seats_count.short_description = 'Available Seats'


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('id', 'trip', 'seat_number', 'is_booked')
    list_filter = ('is_booked',)
    search_fields = ('trip__route__source', 'trip__route__destination', 'seat_number')
