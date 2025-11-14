from rest_framework import generics, permissions
from .serializers import DataCSVSerializer, UserSerializer
from .models import DataCSV
from rest_framework.response import Response
from rest_framework import status 
from django.contrib.auth.models import User
import pandas as pd
from rest_framework.parsers import MultiPartParser, FormParser

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class Last5CSVListView(generics.ListAPIView):
    serializer_class = DataCSVSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DataCSV.objects.filter(user=self.request.user).order_by('-uploaded_at')[:5]

class CSVDeleteView(generics.DestroyAPIView):
    queryset = DataCSV.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response(
                {"detail": "You do not have permission to delete this file."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()
        return Response(
            {"detail": "CSV file deleted successfully."}, 
            status=status.HTTP_204_NO_CONTENT
        )
class CSVFetchView(generics.RetrieveAPIView):
    serializer_class = DataCSVSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DataCSV.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.user != request.user:
            return Response(
                {"detail": "You do not have permission to access this file."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # equipment_list is already stored in JSONField
        return Response({
            "id": instance.id,
            "title": instance.title,
            "total_count": instance.total_count,
            "average_flowrate": instance.average_flowrate,
            "average_pressure": instance.average_pressure,
            "average_temperature": instance.average_temperature,
            "equipment_type_distribution": instance.equipment_type_distribution,
            "equipment_list": instance.equipment_list,  # full equipment rows
            "uploaded_at": instance.uploaded_at,
        }, status=status.HTTP_200_OK)

class CSVUploadView(generics.CreateAPIView):
    serializer_class = DataCSVSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Check if user already has a CSV with this title
        title = serializer.validated_data['title']
        if DataCSV.objects.filter(user=user, title=title).exists():
            return Response(
                {"detail": "You already have a file with this title."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Enforce last 5 datasets only
        user_csv_count = DataCSV.objects.filter(user=user).count()
        if user_csv_count >= 5:
            oldest_csv = DataCSV.objects.filter(user=user).order_by('uploaded_at').first()
            oldest_csv.delete()

        csv_file = serializer.validated_data['csv_file']

        # Read CSV and compute stats
        try:
            df = pd.read_csv(csv_file)
        except Exception as e:
            return Response({"detail": f"Invalid CSV file: {str(e)}"}, status=400)

        total_count = len(df)
        avg_flowrate = df['Flowrate'].mean() if 'Flowrate' in df.columns else 0
        avg_pressure = df['Pressure'].mean() if 'Pressure' in df.columns else 0
        avg_temperature = df['Temperature'].mean() if 'Temperature' in df.columns else 0

        equipment_type_distribution = df['Type'].value_counts().to_dict() if 'Type' in df.columns else {}

        equipment_list = []
        if all(col in df.columns for col in ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']):
            equipment_list = df.to_dict(orient='records')

        # Save CSV entry
        data_csv = serializer.save(
            user=user,
            total_count=total_count,
            average_flowrate=avg_flowrate,
            average_pressure=avg_pressure,
            average_temperature=avg_temperature,
            equipment_type_distribution=equipment_type_distribution,
            equipment_list=equipment_list
        )

        return Response({
            "id": data_csv.id,
            "title": data_csv.title,
            "total_count": data_csv.total_count,
            "average_flowrate": data_csv.average_flowrate,
            "average_pressure": data_csv.average_pressure,
            "average_temperature": data_csv.average_temperature,
            "equipment_type_distribution": data_csv.equipment_type_distribution,
            "equipment_list": data_csv.equipment_list,
        }, status=status.HTTP_201_CREATED)