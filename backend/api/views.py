from rest_framework import generics, permissions
from .serializers import DataCSVSerializer, UserSerializer
from .models import DataCSV
from rest_framework.response import Response
from rest_framework import status 
from django.contrib.auth.models import User

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
 
 
class Last5CSVListView(generics.ListAPIView):
    serializer_class = DataCSVSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DataCSV.objects.filter(user=self.request.user).order_by('-uploaded_at')[:5]

class CSVUploadView(generics.CreateAPIView):
    serializer_class = DataCSVSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
 
        if DataCSV.objects.filter(user=user).count() >= 5: 
            oldest_csv = DataCSV.objects.filter(user=user).order_by('uploaded_at').first()
            oldest_csv.delete()
 
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data_csv = serializer.save(user=user)
 
        return Response({
            "id": data_csv.id,
            "title": data_csv.title,
            "total_count": data_csv.total_count,
            "average_flowrate": data_csv.average_flowrate,
            "average_pressure": data_csv.average_pressure,
            "average_temperature": data_csv.average_temperature,
            "equipment_type_distribution": data_csv.equipment_type_distribution,
        }, status=status.HTTP_201_CREATED)

class CSVDeleteView(generics.DestroyAPIView):
    queryset = DataCSV.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({"detail": "You do not have permission to delete this file."}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()
        return Response({"detail": "CSV file deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
