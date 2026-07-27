import re
from django import forms
from .models import Volunteer

# Create and edit form for volunteer records with field validation.
class VolunteerForm(forms.ModelForm):
    
    class Meta:
        model = Volunteer
        fields = [
            'first_name', 'last_name', 'email', 'phone_number', 'date_of_birth',
            'emergency_contact_name', 'emergency_contact_number',
            'dbs_status', 'dbs_certificate_number', 'dbs_expiry_date', 'skills', 'availability',
        ]
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'First name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Last name'}),
            'email': forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'example@urbanconnect.com'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-input', 'placeholder': '07777 700000'}),
            'date_of_birth': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'emergency_contact_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Full name'}),
            'emergency_contact_number': forms.TextInput(attrs={'class': 'form-input', 'placeholder': '07777 700000'}),
            'dbs_status': forms.Select(attrs={'class': 'form-input'}),
            'dbs_certificate_number': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Certificate Reference Number'}),
            'dbs_expiry_date': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'skills': forms.CheckboxSelectMultiple(),
            'availability': forms.CheckboxSelectMultiple(),
        }
        labels = {
            'first_name': 'First name',
            'last_name': 'Last name',
            'email': 'Email address',
            'phone_number': 'Phone number',
            'date_of_birth': 'Date of birth',
            'emergency_contact_name': 'Emergency contact name',
            'emergency_contact_number': 'Emergency contact number',
            'dbs_status': 'What is the volunteer\'s DBS status?',
            'dbs_certificate_number': 'Certificate reference number',
            'dbs_expiry_date': 'Expiry date',
            'skills': 'Skills',
            'availability': 'Availability',
        }

    # Rejects empty name fields.
    def clean_first_name(self):
        value = self.cleaned_data['first_name'].strip()
        if not value:
            raise forms.ValidationError('First name is required.')
        return value

    def clean_last_name(self):
        value = self.cleaned_data['last_name'].strip()
        if not value:
            raise forms.ValidationError('Last name is required.')
        return value

    # Phone number fields form validation.
    def clean_phone_number(self):
        return self._validate_phone(self.cleaned_data['phone_number'], 'Phone number')

    def clean_emergency_contact_number(self):
        return self._validate_phone(self.cleaned_data['emergency_contact_number'], 'Emergency contact number')


    def _validate_phone(self, value, field_label):
        value = value.strip()
        if not re.fullmatch(r'[0-9+()\-\s]+', value):
            raise forms.ValidationError(
                f'{field_label} must only contain digits, spaces, +, -, and brackets.'
            )
        digits = re.sub(r'\D', '', value)
        if len(digits) < 7:
            raise forms.ValidationError(
                f'Enter a valid {field_label.lower()} that contains a minimum of 7 digits.'
            )
        return value

    # Email is stored in lowercase for consistency.
    def clean_email(self):
        return self.cleaned_data['email'].strip().lower()

    # The certificate reference number and expiry date are only required if the selected DBS status is
    # Verified, they are cleared for every other status. 
    def clean(self):
        cleaned_data = super().clean()
        dbs_status = cleaned_data.get('dbs_status')

        if dbs_status == Volunteer.DBSStatus.VERIFIED:
            if not cleaned_data.get('dbs_certificate_number'):
                self.add_error('dbs_certificate_number', 'Enter the certificate reference number for DBS verification.')
            if not cleaned_data.get('dbs_expiry_date'):
                self.add_error('dbs_expiry_date', 'Enter the expiry date for the certificate for DBS verification.')
        else:
            cleaned_data['dbs_certificate_number'] = ''
            cleaned_data['dbs_expiry_date'] = None
        return cleaned_data