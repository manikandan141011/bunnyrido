from rest_framework import serializers
from .models import Bus, Route


class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ('id', 'name', 'bus_type', 'total_seats', 'registration_number',
                  'amenities', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class RouteSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Route
        fields = ('id', 'source', 'destination', 'distance_km',
                  'duration_hours', 'is_active', 'display_name', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_display_name(self, obj):
        return str(obj)
