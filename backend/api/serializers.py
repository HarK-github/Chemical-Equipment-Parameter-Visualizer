from rest_framework import serializers
from .models import DataCSV
from django.contrib.auth.models import User
import pandas as pd
import io

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

    def validate_csv_file(self, value):
        if not value.name.endswith('.csv'):
            raise serializers.ValidationError("Only CSV files are allowed.")
        return value

    def create(self, validated_data):
        csv_file = validated_data.get('csv_file')

        data = csv_file.read()
        df = pd.read_csv(io.StringIO(data.decode('utf-8')))

        expected_columns = ['Equipment Name', 'Equipment Type', 'Flowrate', 'Pressure', 'Temperature']
        missing_columns = [col for col in expected_columns if col not in df.columns]
        if missing_columns:
            raise serializers.ValidationError(f"Missing required columns: {', '.join(missing_columns)}")
 
        total_count = len(df)
        avg_flowrate = df['Flowrate'].mean()
        avg_pressure = df['Pressure'].mean()
        avg_temperature = df['Temperature'].mean()
        equipment_type_distribution = df['Equipment Type'].value_counts().to_dict()

        instance = DataCSV.objects.create(
            **validated_data,
            total_count=total_count,
            average_flowrate=avg_flowrate,
            average_pressure=avg_pressure,
            average_temperature=avg_temperature,
            equipment_type_distribution=equipment_type_distribution
        )

        return instance
