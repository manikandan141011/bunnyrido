from rest_framework import serializers
from .models import Payment
from bookings.serializers import BookingListSerializer


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a payment."""

    class Meta:
        model = Payment
        fields = ('id', 'booking', 'payment_method')

    def validate_booking(self, value):
        # Check the booking belongs to the current user (or is admin)
        user = self.context['request'].user
        if user.role != 'admin' and value.user != user:
            raise serializers.ValidationError("You can only pay for your own bookings.")

        if value.status == 'CANCELLED':
            raise serializers.ValidationError("Cannot pay for a cancelled booking.")

        if hasattr(value, 'payment') and value.payment.status == 'SUCCESS':
            raise serializers.ValidationError("This booking is already paid.")

        return value

    def create(self, validated_data):
        booking = validated_data['booking']
        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_amount,
            payment_method=validated_data.get('payment_method', 'UPI'),
            status='PENDING',
        )
        payment.generate_transaction_id()
        # Mock: auto-succeed payment
        from django.utils import timezone
        payment.status = 'SUCCESS'
        payment.paid_at = timezone.now()
        payment.save()

        # Update booking status
        booking.status = 'CONFIRMED'
        booking.save()

        return payment


class PaymentListSerializer(serializers.ModelSerializer):
    """Serializer for listing payments."""
    booking_detail = BookingListSerializer(source='booking', read_only=True)
    username = serializers.CharField(source='booking.user.username', read_only=True)

    class Meta:
        model = Payment
        fields = ('id', 'booking', 'booking_detail', 'username', 'amount',
                  'payment_method', 'status', 'transaction_id',
                  'paid_at', 'created_at')
