from django.db import models
from buses.models import Bus, Route


class Trip(models.Model):
    """A scheduled trip on a specific bus and route."""

    STATUS_CHOICES = (
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    bus = models.ForeignKey(
        Bus,
        on_delete=models.CASCADE,
        related_name='trips'
    )
    route = models.ForeignKey(
        Route,
        on_delete=models.CASCADE,
        related_name='trips'
    )
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Price per seat in ₹'
    )
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='SCHEDULED',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trips'
        verbose_name = 'Trip'
        verbose_name_plural = 'Trips'
        ordering = ['departure_time']

    def __str__(self):
        return f"{self.route} | {self.bus.name} | {self.departure_time.strftime('%d-%b-%Y %I:%M %p')}"

    @property
    def available_seats_count(self):
        return self.seats.filter(is_booked=False).count()

    @property
    def total_seats_count(self):
        return self.seats.count()


class Seat(models.Model):
    """Individual seat on a trip."""

    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name='seats'
    )
    seat_number = models.CharField(max_length=5)
    is_booked = models.BooleanField(default=False)

    class Meta:
        db_table = 'seats'
        verbose_name = 'Seat'
        verbose_name_plural = 'Seats'
        unique_together = ('trip', 'seat_number')
        ordering = ['seat_number']

    def __str__(self):
        status = "Booked" if self.is_booked else "Available"
        return f"Seat {self.seat_number} ({status})"


def create_seats_for_trip(trip):
    """Auto-generate seats when a trip is created."""
    seats = []
    for i in range(1, trip.bus.total_seats + 1):
        seats.append(Seat(
            trip=trip,
            seat_number=f"S{i}",
            is_booked=False,
        ))
    Seat.objects.bulk_create(seats)
