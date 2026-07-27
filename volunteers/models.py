from django.db import models

# Volunteer skills and availability are kept as their own tables so the system administrator
# can add new options through the admin interface.

# Volunteer skill options.
class Skill(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


# Volunteer availability time slot options.
class AvailabilitySlot(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Volunteer(models.Model):
    # DBS check status, chosen by the programme coordinator on the volunteer registration form.
    class DBSStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        VERIFIED = 'VERIFIED', 'Verified'
        EXPIRED = 'EXPIRED', 'Expired'
        NOT_APPLICABLE = 'NOT_APPLICABLE', 'Not applicable'

    # Main volunteer details all required during volunteer registration.
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(max_length=255)
    phone_number = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    emergency_contact_name = models.CharField(max_length=100)
    emergency_contact_number = models.CharField(max_length=20)

    # DBS check, the DBS certificate number and expiry date are only required to be recorded when the
    # DBS status selected is Verified, and are cleared by the form for any other status chosen.
    dbs_status = models.CharField(max_length=20, choices=DBSStatus.choices, default=DBSStatus.PENDING)
    dbs_certificate_number = models.CharField(max_length=50, blank=True)
    dbs_expiry_date = models.DateField(null=True, blank=True)

    # A volunteer can have a number of selected skills and availability slots. 
    # The options that are selected are shown on the volunteer's detail screen.
    skills = models.ManyToManyField(Skill, blank=True)
    availability = models.ManyToManyField(AvailabilitySlot, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # System-generated volunteer reference ID.
    volunteer_id = models.CharField(max_length=20, unique=True, blank=True, editable=False)

    class Meta:
        ordering = ['last_name', 'first_name']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    # Volunteer ID is automatically generated using the database assigned ID and the records created_at date.
    # Only generated on the first save, existing ID's never change.
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.volunteer_id:
            self.volunteer_id = f"V-{self.created_at.year}-{self.id:04d}"
            super().save(update_fields=['volunteer_id'])

    def __str__(self):
        return f"{self.full_name} ({self.volunteer_id})"