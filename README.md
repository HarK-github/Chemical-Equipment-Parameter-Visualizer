 

# Chemical-Equipment-Parameter-Visualizer 

The Chemical Equipment Parameter Visualizer is a hybrid application that provides both web and desktop interfaces for analyzing and visualizing chemical equipment data. Users can upload CSV files and view summary statistics, charts, historical datasets, and optionally generate PDF reports.

The system includes:

* Django REST API backend
* React.js web frontend
* PyQt5 desktop application
* Optional Docker deployment with Nginx

---

# Docker Deployment (Primary Deployment Method)

This section describes how to run the complete application stack using Docker Compose. This deployment bundles:

1. Django backend (Gunicorn)
2. React production build
3. Nginx reverse proxy serving the frontend and routing API requests

---

## 1. Prerequisites

* Docker (version 24 or later recommended)
* Docker Compose (version 2 or later)
* Git

---

## 2. Clone the Repository

```bash
git clone <repository_url>
cd chemical-equipment-parameter-visualizer
```

---

## 3. Docker Architecture Overview

Your Docker setup contains three services:

### backend

* Runs Django + Gunicorn
* Exposes port 8000 internally

### frontend

* Builds the React production bundle
* Outputs the compiled `dist/` folder to a shared volume

### Desktop

* PyQt5 app to run on device

## 4. Start the Application

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


## 6. Development Mode 

 

Access the dev server at:

```
http://localhost:5173/
```

---

# Manual Setup (Non-Docker)

This section explains how to run the backend, web frontend, and desktop application directly on your local machine.

---

# Backend: Django

## 1. Navigate to the backend directory

```bash
cd backend
```

## 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate          # Windows
```

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

## 4. Apply migrations

```bash
python manage.py migrate
```

## 5. Start the backend server

```bash
python manage.py runserver
```

The backend will be available at:

```
http://127.0.0.1:8000/
```

---

# Web Frontend: React.js

## 1. Navigate to the frontend directory

```bash
cd ../frontend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Set API endpoint in `.env`

```env
VITE_API_URL=http://127.0.0.1:8000/
```

## 4. Start the development server

```bash
npm run dev
```

Frontend available at:

```
http://localhost:3000/
```

---

# Desktop Application: PyQt5

## 1. Navigate to the desktop folder

```bash
cd ../desktop
```

## 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

## 4. Run the desktop application

```bash
python main.py
```

---

# Features

* CSV upload
* Summary statistics generation
* Visualization (Chart.js for web, Matplotlib for desktop)
* Storage of last five uploaded datasets
* PDF report generation
* Basic user authentication
* SQLite persistence

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

 