from django.conf import settings
from django.db import models
from trips.models import Trip, Seat


class Booking(models.Model):
    """A booking made by a customer for one or more seats on a trip."""

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    seats = models.ManyToManyField(
        Seat,
        related_name='bookings'
    )
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Total booking amount in ₹'
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING',
    )
    passenger_name = models.CharField(max_length=100, blank=True)
    passenger_email = models.EmailField(blank=True)
    passenger_phone = models.CharField(max_length=15, blank=True)
    booked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-booked_at']

    def __str__(self):
        return f"Booking #{self.id} - {self.user.username} - {self.trip.route}"
