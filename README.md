<div align="center">

# Chemical-Equipment-Parameter-Visualizer

</div>
<br>
<br>
<div align="center">
  Deployed Link: <a href="https://chemical-equipment-parameter-visualizer-1-lmh9.onrender.com/"> https://chemical-equipment-parameter-visualizer-1-lmh9.onrender.com/</a>
</div>


## Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/c500087c-08cf-42f2-a7e5-5e698023a8d0" alt="Image 1" width="45%"/>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://github.com/user-attachments/assets/a0e993d0-69f8-4f25-ae81-58322719446b" alt="Image 2" width="45%"/>
</p>
## Project Overview

The Chemical Equipment Parameter Visualizer is a hybrid application that provides both web and desktop interfaces for analyzing and visualizing chemical equipment data. Users can upload CSV files and view summary statistics, charts, historical datasets, and optionally generate PDF reports.

The system includes:

* Django REST API backend
* React.js web frontend
* PyQt5 desktop application

The dekstop and web application use the same backend server.
--- 

## 📁File Structure

### Backend Directory
```
backend/
├── api/                           # Django app for API endpoints
│   ├── admin.py                  
│   ├── models.py                
│   ├── serializers.py           
│   ├── views.py                  
│   └── migrations/              
├── backend/                      
│   ├── settings.py               
│   ├── deployment_settings.py    # For deployment               
│   ├── urls.py                   
│   └── wsgi.py                   # WSGI configuration for production
├── csv_files/                    # Directory for uploaded CSV files
├── db.sqlite3                    # SQLite database file
├── Dockerfile                    # Container configuration for backend
├── manage.py                     
└── requirements.txt              # Python dependencies list
```

### Frontend Directory
```
frontend/
├── src/                          # Source code directory
│   ├── api.tsx                   # API service functions
│   ├── App.tsx                   # Main React application component
│   ├── components/               # Reusable React components
│   │   ├── Charts.tsx            
│   │   ├── ExportPdf.tsx         
│   │   ├── navbar.tsx           
│   │   └── ProtectedRoute.tsx    # Route protection for authentication
│   ├── pages/                    # Page components
│   │   ├── dashboard.tsx         
│   │   ├── home.tsx             
│   │   ├── login.tsx             
│   │   └── register.tsx          
│   ├── store/                    # State management
│   │   ├── authSlice.ts          # Authentication state slice
│   │   └── store.ts              
│   └── types/                    
│       └── index.ts              # Main type definitions
├── package.json                  
├── Dockerfile                    
└── nginx.config                  # Nginx web server configuration
```

### Desktop Directory
```
desktop/
├── main.py                       # Main PyQt5 application entry point
└── requirements.txt              # Python dependencies for desktop app
```


# Running application

This section describes how to run the complete application stack using Docker Compose on your local device. 
---

## 1. Prerequisites

* Docker
* Docker Compose 
* Git

---

## 2. Clone the Repository

```bash
git clone https://github.com/HarK-github/Chemical-Equipment-Parameter-Visualizer.git
cd Chemical-Equipment-Parameter-Visualizer
```

---

## 3. Start the Application

From the project root:

```bash
docker compose up --build
```

Once all containers are running:

* Web application:
  `http://localhost/`

* Backend API (direct):
  `http://127.0.0.1:8000/`

* Frontend:
  `http://localhost:5173/`

---


## 4. Development Mode 


Access the dev server at:

```
http://localhost:5173/
```

---

# 🛠 Manual Setup 
This section explains how to run the backend, web frontend, and desktop application directly on your local machine without using docker container
---

## Backend: Django

###  1. Navigate to the backend directory

```bash
cd backend
```

###  2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate          # Windows
```

###  3. Install dependencies

```bash
pip install -r requirements.txt
```

###  4. Apply migrations

```bash
python manage.py migrate
```

###  5. Start the backend server

```bash
python manage.py runserver
```

The backend will be available at:

```
http://127.0.0.1:8000/
```

---

## Web Frontend: React.js

### 1. Navigate to the frontend directory

```bash
cd ./frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set API endpoint in `.env`

```env
VITE_API_URL=http://127.0.0.1:8000/
```

### 4. Start the development server

```bash
npm run dev
```

Frontend available at:

```
http://localhost:5731/
```

---

## Desktop Application: PyQt5

### 1. Navigate to the desktop folder

```bash
cd ./desktop
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the desktop application

```bash
python main.py
```

### Alternative:

Go to root directory of the project,create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

Now run



---

# Features

* CSV upload
* Summary statistics generation
* Visualization (Chart.js for web, Matplotlib for desktop)
* Storage of last five uploaded datasets
* PDF report generation
* Basic user authentication 

---

# Project Structure

```
chemical-equipment-visualizer/
│
├─ backend/                    # Django backend
├─ frontend/                   # React.js frontend
├─ desktop/                    # PyQt5 desktop app
├─ nginx/                      # Nginx config
└─ docker-compose.yml
```

---

# License

This project is licensed under the MIT License.
Developed by Harshit Kandpal

 
