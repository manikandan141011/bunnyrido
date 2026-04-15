from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Payment
from .serializers import PaymentCreateSerializer, PaymentListSerializer


class PaymentCreateView(generics.CreateAPIView):
    """
    POST /api/payments/
    Create a payment for a booking (mock auto-success).
    """
    serializer_class = PaymentCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context


class PaymentListView(generics.ListAPIView):
    """
    GET /api/payments/
    - Customers: see own payments
    - Admins: see all payments
    """
    serializer_class = PaymentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.select_related(
            'booking', 'booking__user', 'booking__trip',
            'booking__trip__bus', 'booking__trip__route'
        )

        if user.role == 'admin':
            return queryset.all()
        return queryset.filter(booking__user=user)


class PaymentDetailView(generics.RetrieveAPIView):
    """
    GET /api/payments/<id>/
    View payment details.
    """
    serializer_class = PaymentListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.select_related(
            'booking', 'booking__user', 'booking__trip',
            'booking__trip__bus', 'booking__trip__route'
        )

        if user.role == 'admin':
            return queryset.all()
        return queryset.filter(booking__user=user)
