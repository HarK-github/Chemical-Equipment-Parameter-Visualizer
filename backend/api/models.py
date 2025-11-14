from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
import os
import logging
logger = logging.getLogger(__name__)

def user_csv_file_path(instance, filename):
    """
    Upload CSV files to a user-specific folder with a timestamp to prevent overwriting.
    Example: csv_files/3/20251115123045_mydata.csv
    """
    timestamp = now().strftime("%Y%m%d%H%M%S")
    return os.path.join(
        'csv_files',
        str(instance.user.id),
        f"{timestamp}_{filename}"
    )

class DataCSV(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=100)
    csv_file = models.FileField(upload_to=user_csv_file_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    total_count = models.IntegerField(null=True, blank=True)
    average_flowrate = models.FloatField(null=True, blank=True)
    average_pressure = models.FloatField(null=True, blank=True)
    average_temperature = models.FloatField(null=True, blank=True)

    equipment_type_distribution = models.JSONField(null=True, blank=True)
    equipment_list = models.JSONField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'title')  # Prevent same user from uploading same title

    def __str__(self):
        return self.title
    
    def delete(self, *args, **kwargs):
        # Delete the file from storage before deleting the model
        if self.csv_file:
            if os.path.isfile(self.csv_file.path):
                os.remove(self.csv_file.path)
        super().delete(*args, **kwargs)
