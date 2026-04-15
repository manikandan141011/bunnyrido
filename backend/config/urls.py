"""
BunnyRido URL Configuration

API Endpoints:
    /api/auth/      → User registration, login (JWT), profile
    /api/           → Buses, Routes (from buses app)
    /api/           → Trips, Seats (from trips app)
    /api/bookings/  → Booking CRUD
    /api/payments/  → Payment CRUD
    /admin/         → Django admin panel
"""

from django.contrib import admin
from django.urls import path, include

# Customize admin site
admin.site.site_header = '🐰 BunnyRido Admin'
admin.site.site_title = 'BunnyRido Admin Portal'
admin.site.index_title = 'Welcome to BunnyRido Administration'

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Auth endpoints
    path('api/auth/', include('users.urls', namespace='users')),

    # Bus & Route endpoints
    path('api/', include('buses.urls', namespace='buses')),

    # Trip & Seat endpoints
    path('api/', include('trips.urls', namespace='trips')),

    # Booking endpoints
    path('api/bookings/', include('bookings.urls', namespace='bookings')),

    # Payment endpoints
    path('api/payments/', include('payments.urls', namespace='payments')),
]
