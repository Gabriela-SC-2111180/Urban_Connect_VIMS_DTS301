from django.contrib.auth import views as auth_views
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import TemplateView
from .models import User

# Which dashboard each role is redirected to after logging in.
ROLE_DASHBOARD_URLS = {
    User.Role.ADMIN: 'dashboard_admin',
    # Programme Coordinator goes straight to the volunteer list (volunteers app), which is their main dashboard.
    User.Role.PROGRAMME_COORDINATOR: 'volunteer_list',
    User.Role.OPERATIONS: 'dashboard_operations',
    User.Role.FUNDER_RELATIONS: 'dashboard_funder_relations',
    User.Role.VOLUNTEER_COORDINATOR: 'dashboard_volunteer_coordinator',
}

# Login page
class VIMSLoginView(auth_views.LoginView):
    template_name = 'registration/login.html'

    def get_success_url(self):
        user = self.request.user
        # Admins are automatically redirected to Django's built-in admin interface.
        if user.role == User.Role.ADMIN:
            return reverse_lazy('admin:index')
        return reverse_lazy(ROLE_DASHBOARD_URLS[user.role])


# Placeholder's for each role specific dashboard:
class OperationsDashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/dashboard_operations.html'


class FunderRelationsDashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/dashboard_funder_relations.html'

class VolunteerCoordinatorDashboardView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/dashboard_volunteer_coordinator.html'