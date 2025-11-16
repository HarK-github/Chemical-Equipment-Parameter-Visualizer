
# Chemical-Equipment-Parameter-Visualizer 

The **Chemical Equipment Parameter Visualizer** is a hybrid application that provides both web and desktop interfaces for visualizing and analyzing chemical equipment data. Users can upload CSV files containing equipment information, and the app generates summary statistics, charts, and historical data insights.

My project demonstrates a full-stack setup using a Django backend and two separate frontends: **React.js** for web and **PyQt5** for desktop.

---

## Features

* **CSV Upload:** Upload CSV files containing equipment data (`Equipment Name`, `Type`, `Flowrate`, `Pressure`, `Temperature`).
* **Data Summary API:** Backend API calculates total count, averages, and equipment type distribution.
* **Visualization:**

  * **Web:** Chart.js displays bar charts, pie charts, and scatter plots. HeroUI provides UI components and theming.
  * **Desktop:** Matplotlib provides the same visualizations in a standalone PyQt5 app.
* **History Management:** Stores the last 5 uploaded datasets with summaries.
* **PDF Reports:** Generate PDF reports of uploaded datasets.
* **Authentication:** Basic authentication for secure access.

---

## Tech Stack

| Layer              | Technology                            | Purpose                           |
| ------------------ | ------------------------------------- | --------------------------------- |
| Frontend (Web)     | React.js + Chart.js                   | Table and chart visualization     |
| Frontend (Desktop) | PyQt5 + Matplotlib                    | Desktop visualization             |
| Backend            | Python Django + Django REST Framework | API and data processing           |
| Data Handling      | Pandas                                | CSV parsing and analytics         |
| Database           | SQLite                                | Store last 5 uploaded datasets    |
| Version Control    | Git & GitHub                          | Code management and collaboration |

---

## Getting Started

### Prerequisites

* Python >= 3.9
* Node.js >= 18
* npm or yarn
* pip packages: `Django`, `djangorestframework`, `pandas`, `matplotlib`, `PyQt5`, `reportlab`

---

### Backend Setup (Django)

1. Clone the repository:

```bash
git clone <repository_url>
cd chemical-equipment-visualizer/backend
```

2. **Create a virtual environment** and activate it:

```bash
python -m venv venv       # Create venv
# Activate:
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Apply migrations:

```bash
python manage.py migrate
```

5. Run the backend server:

```bash
python manage.py runserver
```

The API will be available at:

```
http://127.0.0.1:8000/
```

---

### Web Frontend Setup (React.js)

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set your backend API URL in `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/
```

> **Note:** When running in Docker Compose, replace `127.0.0.1` with the backend service name (e.g., `http://backend:8000/`).

4. Start the development server:

```bash
npm run dev
```

The web app will run at:

```
http://localhost:3000/
```

---

### Desktop Frontend Setup (PyQt5)

1. Navigate to the desktop app directory:

```bash
cd ../desktop
```

2. Create a virtual environment and activate it (recommended):

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the PyQt5 app:

```bash
python main.py
```

---

## Usage

1. Open the web or desktop app.
2. Authenticate using your credentials (or register if new).
3. Upload a CSV file containing equipment data.
4. View summary statistics, charts, and historical datasets.
5. Optionally, generate a PDF report for the uploaded dataset.

---

## Sample CSV Format

| Equipment Name | Type    | Flowrate | Pressure | Temperature |
| -------------- | ------- | -------- | -------- | ----------- |
| Pump A         | Pump    | 50       | 10       | 120         |
| Valve B        | Valve   | 30       | 15       | 90          |
| Reactor C      | Reactor | 80       | 20       | 150         |

---

## Project Structure

```
chemical-equipment-visualizer/
│
├─ backend/                  # Django backend
│  ├─ api/                   # App: models, serializers, views
│  ├─ db.sqlite3
│  └─ manage.py
│
├─ frontend-web/             # React.js frontend
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  └─ api.tsx
│  └─ package.json
│
├─ frontend-desktop/         # PyQt5 frontend
│  ├─ main.py
│  ├─ ui/
│  └─ requirements.txt
│
└─ README.md
```

---

## Docker Setup (Optional)

You can containerize the frontend and backend for easier deployment. Example:

```bash
# Build and start services
docker-compose up --build
```

> The frontend and backend can communicate using service names in Docker Compose (e.g., `http://backend:8000/`).

---

## Demo Video

Include a short demo (2–3 minutes) showing:

* CSV upload
* Data visualization (charts & tables)
* History and PDF generation
* Authentication flow

---

## License

This project is licensed under the **MIT License**.

---
 