from django.contrib import admin
from .models import AvailabilitySlot, Skill, Volunteer

# The system administrator can add or rename the skill and availability options
# that appear in the volunteer registration form's tick box section.
admin.site.register(Skill)
admin.site.register(AvailabilitySlot)

# The system administrator can manage Volunteer records on the admin interface.
@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    list_display = ('volunteer_id', 'first_name', 'last_name', 'email', 'phone_number', 'dbs_status')
    search_fields = ('first_name', 'last_name', 'email', 'phone_number', 'volunteer_id')
    list_filter = ('dbs_status',)
    readonly_fields = ('volunteer_id', 'created_at', 'updated_at')
    filter_horizontal = ('skills', 'availability')