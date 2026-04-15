from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import TripViewSet, SeatListView

app_name = 'trips'

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')

urlpatterns = [
    path('', include(router.urls)),
    path('trips/<int:trip_id>/seats/', SeatListView.as_view(), name='trip-seats'),
]
