from django.db import models
from django.contrib.auth.models import User

class DataCSV(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=100)
    csv_file = models.FileField(upload_to='csv_files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    total_count = models.IntegerField(null=True, blank=True)
    average_flowrate = models.FloatField(null=True, blank=True)
    average_pressure = models.FloatField(null=True, blank=True)
    average_temperature = models.FloatField(null=True, blank=True)
    equipment_type_distribution = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.title
