from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from users.permissions import IsAdminRole
from .models import Bus, Route
from .serializers import BusSerializer, RouteSerializer


class BusViewSet(viewsets.ModelViewSet):
    """
    Bus management endpoints.
    - GET (list/retrieve): Anyone can view buses
    - POST/PUT/DELETE: Admin only
    """
    queryset = Bus.objects.filter(is_active=True)
    serializer_class = BusSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminRole()]


class RouteViewSet(viewsets.ModelViewSet):
    """
    Route management endpoints.
    - GET (list/retrieve): Anyone can view routes
    - POST/PUT/DELETE: Admin only
    """
    queryset = Route.objects.filter(is_active=True)
    serializer_class = RouteSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminRole()]
