from django.contrib.auth import views as auth_views
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.VIMSLoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    # Operations Manager dashboard
    path('dashboard/operations/', views.OperationsDashboardView.as_view(), name='dashboard_operations'),
    
    # Funder-Relations Manager dashboard
    path('dashboard/funder-relations/', views.FunderRelationsDashboardView.as_view(), name='dashboard_funder_relations'),
    
    # Volunteer Co-ordinator dashboard
    path('dashboard/volunteer-coordinator/', views.VolunteerCoordinatorDashboardView.as_view(), name='dashboard_volunteer_coordinator'),
]