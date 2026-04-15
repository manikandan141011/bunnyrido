from rest_framework import serializers
from .models import Trip, Seat
from buses.serializers import BusSerializer, RouteSerializer


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ('id', 'seat_number', 'is_booked')
        read_only_fields = ('id',)


class TripListSerializer(serializers.ModelSerializer):
    """Serializer for listing trips (lightweight)."""
    bus_name = serializers.CharField(source='bus.name', read_only=True)
    bus_type = serializers.CharField(source='bus.bus_type', read_only=True)
    source = serializers.CharField(source='route.source', read_only=True)
    destination = serializers.CharField(source='route.destination', read_only=True)
    available_seats = serializers.IntegerField(source='available_seats_count', read_only=True)
    total_seats = serializers.IntegerField(source='total_seats_count', read_only=True)

    class Meta:
        model = Trip
        fields = ('id', 'bus', 'bus_name', 'bus_type', 'route', 'source',
                  'destination', 'departure_time', 'arrival_time', 'price',
                  'status', 'available_seats', 'total_seats')


class TripDetailSerializer(serializers.ModelSerializer):
    """Serializer for trip detail with nested bus/route/seats."""
    bus_detail = BusSerializer(source='bus', read_only=True)
    route_detail = RouteSerializer(source='route', read_only=True)
    seats = SeatSerializer(many=True, read_only=True)
    available_seats = serializers.IntegerField(source='available_seats_count', read_only=True)

    class Meta:
        model = Trip
        fields = ('id', 'bus', 'bus_detail', 'route', 'route_detail',
                  'departure_time', 'arrival_time', 'price', 'status',
                  'seats', 'available_seats', 'created_at', 'updated_at')


class TripCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating trips (admin)."""

    class Meta:
        model = Trip
        fields = ('id', 'bus', 'route', 'departure_time', 'arrival_time',
                  'price', 'status')

    def validate(self, attrs):
        if attrs.get('departure_time') and attrs.get('arrival_time'):
            if attrs['departure_time'] >= attrs['arrival_time']:
                raise serializers.ValidationError(
                    "Arrival time must be after departure time."
                )
        return attrs
