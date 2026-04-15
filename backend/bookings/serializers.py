from rest_framework import serializers
from .models import Booking
from trips.serializers import SeatSerializer, TripListSerializer


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a booking."""
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        help_text='List of seat IDs to book'
    )

    class Meta:
        model = Booking
        fields = ('id', 'trip', 'seat_ids', 'passenger_name',
                  'passenger_email', 'passenger_phone')

    def validate_seat_ids(self, value):
        if not value:
            raise serializers.ValidationError("At least one seat must be selected.")
        return value

    def validate(self, attrs):
        from trips.models import Seat
        trip = attrs['trip']
        seat_ids = attrs['seat_ids']

        # Verify all seats belong to the trip and are available
        seats = Seat.objects.filter(id__in=seat_ids, trip=trip)
        if seats.count() != len(seat_ids):
            raise serializers.ValidationError(
                "One or more seats are invalid or don't belong to this trip."
            )

        booked_seats = seats.filter(is_booked=True)
        if booked_seats.exists():
            booked_numbers = list(booked_seats.values_list('seat_number', flat=True))
            raise serializers.ValidationError(
                f"Seats already booked: {', '.join(booked_numbers)}"
            )

        attrs['_seats'] = seats
        return attrs

    def create(self, validated_data):
        seat_ids = validated_data.pop('seat_ids')
        seats = validated_data.pop('_seats')
        trip = validated_data['trip']

        # Calculate total amount
        total_amount = trip.price * len(seat_ids)
        validated_data['total_amount'] = total_amount
        validated_data['user'] = self.context['request'].user

        # Create booking
        booking = Booking.objects.create(**validated_data)
        booking.seats.set(seats)

        # Mark seats as booked
        seats.update(is_booked=True)

        return booking


class BookingListSerializer(serializers.ModelSerializer):
    """Serializer for listing bookings."""
    trip_detail = TripListSerializer(source='trip', read_only=True)
    seats = SeatSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'user', 'username', 'trip', 'trip_detail', 'seats',
                  'total_amount', 'status', 'passenger_name',
                  'passenger_email', 'passenger_phone', 'booked_at')


class BookingCancelSerializer(serializers.Serializer):
    """Serializer for cancelling a booking."""
    reason = serializers.CharField(required=False, allow_blank=True)
