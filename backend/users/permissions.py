from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """
    Allow access only to users with admin role.
    Used for admin-only API endpoints (manage buses, trips, etc.)
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Allow access to object owner or admin users.
    Used for bookings/payments where customers see their own data
    and admins see everything.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        # Check if the object has a 'user' field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
