from django.contrib import messages
from django.db.models import Q
from django.http import Http404
from django.shortcuts import redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import DatabaseError
from django.views.generic import ListView, CreateView
from .models import Volunteer
from django.urls import reverse_lazy
from .forms import VolunteerForm 

# Volunteer queryset filtering function for the search functionality.
# A volunteer record is matched based on their name, email address or phone number.
def filter_volunteers(queryset, query):
    query = (query or '').strip()
    if query:
        queryset = queryset.filter(
            Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
            | Q(email__icontains=query)
            | Q(phone_number__icontains=query)
        )
    return queryset

# Missing volunteer record redirect mixin to be used for the UpdateView, DeleteView and DetailView for
# handling 404 errors or a database failure error.
class RecordNotFoundRedirectMixin:

    def dispatch(self, request, *args, **kwargs):
        try:
            return super().dispatch(request, *args, **kwargs)
        except Http404:
            messages.error(
                request,
                'Sorry, that volunteer record could not be found. '
                'It may have already been deleted.'
            )
            return redirect('volunteer_list')
        except DatabaseError:
            messages.error(
                request,
                'The volunteer record could not be loaded due to a database error. '
                'Please try again.'
            )
            return redirect('volunteer_list')

# The programme coordinators main dashboard, listing all the volunteer records and containing the search box.
class VolunteerListView(LoginRequiredMixin, ListView):
    model = Volunteer
    template_name = 'volunteers/volunteer_list.html'
    context_object_name = 'volunteers'

    def get_queryset(self):
        try:
            return filter_volunteers(super().get_queryset(), self.request.GET.get('q'))
        
        # If the database can't be reached an empty list gets returned with an error message.
        except DatabaseError:
            messages.error(
                self.request,
                'The volunteer records could not be loaded due to a database error. '
                'Please try again.'
            )
            return Volunteer.objects.none()

    # Passes back the current search input to the template so
    # the search box shows what search is currently applied.
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['q'] = self.request.GET.get('q', '')
        return context
    
# Registers a new volunteer record from the form then returns the programme coordinator
# back to the volunteer records list with a success message.
class VolunteerCreateView(LoginRequiredMixin, CreateView):
    model = Volunteer
    form_class = VolunteerForm
    template_name = 'form/register_volunteer_form.html'
    success_url = reverse_lazy('volunteer_list')

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, f'{self.object.full_name} has been successfully registered.')
        return response