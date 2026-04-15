from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import BusViewSet, RouteViewSet

app_name = 'buses'

router = DefaultRouter()
router.register(r'buses', BusViewSet, basename='bus')
router.register(r'routes', RouteViewSet, basename='route')

urlpatterns = [
    path('', include(router.urls)),
]
