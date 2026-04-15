from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'payment_method', 'status',
                    'transaction_id', 'paid_at')
    list_filter = ('status', 'payment_method', 'paid_at')
    search_fields = ('transaction_id', 'booking__user__username',
                     'booking__user__email')
    ordering = ('-created_at',)
    readonly_fields = ('transaction_id', 'paid_at', 'created_at')
