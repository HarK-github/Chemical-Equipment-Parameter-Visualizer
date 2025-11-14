from rest_framework import serializers
from .models import DataCSV
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class DataCSVSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataCSV
        fields = ['id', 'user', 'title', 'csv_file', 'uploaded_at',
                  'total_count', 'average_flowrate', 'average_pressure',
                  'average_temperature', 'equipment_type_distribution']
        read_only_fields = ['id', 'uploaded_at', 'total_count', 'average_flowrate', 
                           'average_pressure', 'average_temperature', 'equipment_type_distribution']

    def validate_csv_file(self, value):
        if not value.name.endswith('.csv'):
            raise serializers.ValidationError("Only CSV files are allowed.")
        return value

    def create(self, validated_data):
        # The view handles all CSV processing and passes pre-calculated stats
        # Just create the instance with the provided data
        instance = DataCSV.objects.create(**validated_data)
        return instance