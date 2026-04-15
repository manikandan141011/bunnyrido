from rest_framework import viewsets, generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsAdminRole
from .models import Trip, Seat, create_seats_for_trip
from .serializers import (
    TripListSerializer,
    TripDetailSerializer,
    TripCreateSerializer,
    SeatSerializer,
)


class TripViewSet(viewsets.ModelViewSet):
    """
    Trip management and search endpoints.
    - GET (list/retrieve): Anyone can search/view trips
    - POST/PUT/DELETE: Admin only
    - Auto-generates seats on trip creation
    """
    queryset = Trip.objects.select_related('bus', 'route').all()

    def get_serializer_class(self):
        if self.action == 'list':
            return TripListSerializer
        if self.action == 'retrieve':
            return TripDetailSerializer
        return TripCreateSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminRole()]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Allow filtering by source, destination, date
        source = self.request.query_params.get('source')
        destination = self.request.query_params.get('destination')
        date = self.request.query_params.get('date')
        status_filter = self.request.query_params.get('status')

        if source:
            queryset = queryset.filter(route__source__icontains=source)
        if destination:
            queryset = queryset.filter(route__destination__icontains=destination)
        if date:
            queryset = queryset.filter(departure_time__date=date)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def perform_create(self, serializer):
        """Create trip and auto-generate seats."""
        trip = serializer.save()
        create_seats_for_trip(trip)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Return detailed response
        trip = Trip.objects.select_related('bus', 'route').get(pk=serializer.instance.pk)
        return Response(
            TripDetailSerializer(trip).data,
            status=status.HTTP_201_CREATED,
        )


class SeatListView(generics.ListAPIView):
    """
    GET /api/trips/<trip_id>/seats/
    List all seats for a specific trip.
    """
    serializer_class = SeatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        trip_id = self.kwargs['trip_id']
        return Seat.objects.filter(trip_id=trip_id)
