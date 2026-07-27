from django.urls import path
from . import views

urlpatterns = [
    # Volunteer records list, the programme coordinators main dashboard.
    path('', views.VolunteerListView.as_view(), name='volunteer_list'),
    
    # Registration form for adding a new volunteer record.
    path('register/', views.VolunteerCreateView.as_view(), name='volunteer_register'),
]
