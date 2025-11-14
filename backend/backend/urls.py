"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from api.views import (
    CreateUserView,
    CSVUploadView,
    CSVDeleteView,
    Last5CSVListView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # User registration
    path("api/user/register/", CreateUserView.as_view(), name="register"),

    # JWT authentication
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh_token"),

    # DRF login (optional)
    path("api-auth/", include("rest_framework.urls")),

    # CSV Upload & Analytics
    path("api/upload-csv/", CSVUploadView.as_view(), name="upload-csv"),

    # CSV Delete
    path("api/delete-csv/<int:pk>/", CSVDeleteView.as_view(), name="delete-csv"),

    # Last 5 CSVs
    path("api/last5-csv/", Last5CSVListView.as_view(), name="last5-csv"),
]
