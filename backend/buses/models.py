from django.db import models


class Bus(models.Model):
    """A bus that can be assigned to trips."""

    BUS_TYPE_CHOICES = (
        ('AC', 'AC'),
        ('NON_AC', 'Non-AC'),
        ('SLEEPER', 'Sleeper'),
        ('SEMI_SLEEPER', 'Semi-Sleeper'),
    )

    name = models.CharField(max_length=100, help_text='Bus name/number')
    bus_type = models.CharField(
        max_length=15,
        choices=BUS_TYPE_CHOICES,
        default='AC',
    )
    total_seats = models.PositiveIntegerField(default=40)
    registration_number = models.CharField(
        max_length=20,
        unique=True,
        help_text='Vehicle registration number'
    )
    amenities = models.TextField(
        blank=True,
        default='',
        help_text='Comma-separated amenities (e.g., WiFi, Charging Point, Blanket)'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buses'
        verbose_name = 'Bus'
        verbose_name_plural = 'Buses'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.registration_number})"


class Route(models.Model):
    """A route between two cities."""

    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    distance_km = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Distance in kilometers'
    )
    duration_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Estimated duration in hours'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'routes'
        verbose_name = 'Route'
        verbose_name_plural = 'Routes'
        unique_together = ('source', 'destination')
        ordering = ['source', 'destination']

    def __str__(self):
        return f"{self.source} → {self.destination}"
