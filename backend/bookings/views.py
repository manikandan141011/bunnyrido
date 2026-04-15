from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsAdminRole
from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingListSerializer,
    BookingCancelSerializer,
)


class BookingCreateView(generics.CreateAPIView):
    """
    POST /api/bookings/
    Create a new booking (customer).
    """
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(
            BookingListSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class BookingListView(generics.ListAPIView):
    """
    GET /api/bookings/
    - Customers: see own bookings
    - Admins: see all bookings
    """
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.select_related('user', 'trip', 'trip__bus', 'trip__route')

        if user.role == 'admin':
            return queryset.all()
        return queryset.filter(user=user)


class BookingDetailView(generics.RetrieveAPIView):
    """
    GET /api/bookings/<id>/
    View booking details.
    """
    serializer_class = BookingListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.select_related('user', 'trip', 'trip__bus', 'trip__route')

        if user.role == 'admin':
            return queryset.all()
        return queryset.filter(user=user)


class BookingCancelView(APIView):
    """
    POST /api/bookings/<id>/cancel/
    Cancel a booking and release seats.
    - Customers: cancel own bookings
    - Admins: cancel any booking
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            if request.user.role == 'admin':
                booking = Booking.objects.get(pk=pk)
            else:
                booking = Booking.objects.get(pk=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.status == 'CANCELLED':
            return Response(
                {"error": "Booking is already cancelled"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Release seats
        booking.seats.update(is_booked=False)
        booking.status = 'CANCELLED'
        booking.save()

        # Cancel associated payment if exists
        if hasattr(booking, 'payment'):
            booking.payment.status = 'REFUNDED'
            booking.payment.save()

        return Response(
            {
                "message": "Booking cancelled successfully",
                "booking": BookingListSerializer(booking).data,
            }
        )
