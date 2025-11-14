import sys
import requests
import pandas as pd
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QLabel, QLineEdit,
    QPushButton, QFileDialog, QTableWidget, QTableWidgetItem,
    QComboBox, QMessageBox
)
from PyQt5.QtCore import Qt

import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas


API_BASE_URL = "http://127.0.0.1:8000/api"   # <<< YOUR BACKEND HERE


class DesktopApp(QWidget):
    def __init__(self):
        super().__init__()

        self.token = None
        self.csv_data = []
        self.csv_id = None

        self.setWindowTitle("Chemical Equipment Visualizer (Desktop)")
        self.setGeometry(200, 100, 900, 700)

        self.layout = QVBoxLayout()

        # ------------------ AUTH UI ------------------
        self.login_label = QLabel("Login Required")
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)

        self.login_button = QPushButton("Login")
        self.login_button.clicked.connect(self.login)

        self.layout.addWidget(self.login_label)
        self.layout.addWidget(self.username_input)
        self.layout.addWidget(self.password_input)
        self.layout.addWidget(self.login_button)

        # ------------------ AFTER LOGIN UI ------------------
        self.upload_button = QPushButton("Upload CSV")
        self.upload_button.clicked.connect(self.select_csv)
        self.upload_button.setVisible(False)

        self.delete_button = QPushButton("Delete CSV")
        self.delete_button.clicked.connect(self.delete_csv)
        self.delete_button.setVisible(False)

        self.status_label = QLabel("")
        self.status_label.setStyleSheet("font-weight: bold; color: green;")

        self.table = QTableWidget()
        self.table.setVisible(False)

        # Combo box to select existing CSV for deletion
        self.csv_select_combo = QComboBox()
        self.csv_select_combo.setVisible(False)

        # Chart area
        self.figure = plt.figure(figsize=(6, 4))
        self.canvas = FigureCanvas(self.figure)
        self.canvas.setVisible(False)

        self.layout.addWidget(self.upload_button)
        self.layout.addWidget(self.csv_select_combo)
        self.layout.addWidget(self.delete_button)
        self.layout.addWidget(self.status_label)
        self.layout.addWidget(self.table)
        self.layout.addWidget(self.canvas)

        self.setLayout(self.layout)

    # ---------------------------------------------------------
    # LOGIN
    # ---------------------------------------------------------
    def login(self):
        username = self.username_input.text()
        password = self.password_input.text()

        try:
            response = requests.post(
                f"{API_BASE_URL}/token/",
                data={"username": username, "password": password}
            )

            if response.status_code == 200:
                self.token = response.json()["access"]
                self.status_label.setText("Login successful!")

                self.upload_button.setVisible(True)
                self.csv_select_combo.setVisible(True)
                self.delete_button.setVisible(True)
                self.table.setVisible(True)
                self.canvas.setVisible(True)

                # Hide login fields
                self.login_label.setVisible(False)
                self.username_input.setVisible(False)
                self.password_input.setVisible(False)
                self.login_button.setVisible(False)

                # Fetch last 5 CSVs after login
                self.fetch_last_5_csvs()

            else:
                self.status_label.setText("Invalid credentials!")

        except Exception as e:
            self.status_label.setText(f"Error: {str(e)}")

    # ---------------------------------------------------------
    # FETCH LAST 5 CSVs
    # ---------------------------------------------------------
    def fetch_last_5_csvs(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        r = requests.get(f"{API_BASE_URL}/last5-csv/", headers=headers)

        if r.status_code == 200:
            self.csv_data = r.json()
            self.csv_select_combo.clear()  # Clear previous entries
            self.csv_select_combo.addItem("Select CSV to Delete")

            # Populate dropdown with CSV titles
            for csv in self.csv_data:
                self.csv_select_combo.addItem(csv["title"], userData=csv["id"])

        else:
            self.status_label.setText("Error fetching CSVs!")

    # ---------------------------------------------------------
    # CSV UPLOAD
    # ---------------------------------------------------------
    def select_csv(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select CSV", "", "CSV Files (*.csv)")
        if file_path:
            self.upload_csv(file_path)

    def upload_csv(self, path):
        headers = {"Authorization": f"Bearer {self.token}"}

        files = {"csv_file": open(path, "rb")}
        data = {"title": path.split("/")[-1]}

        r = requests.post(f"{API_BASE_URL}/upload-csv/", files=files, data=data, headers=headers)

        if r.status_code == 201:
            self.status_label.setText("CSV Upload Successful!")
            csv_id = r.json()["id"]
            self.fetch_last_5_csvs()
            self.fetch_data(csv_id)
        else:
            msg = r.json().get("detail", "Upload failed")
            self.status_label.setText(f"Error: {msg}")

    # ---------------------------------------------------------
    # CSV DELETE
    # ---------------------------------------------------------
    def delete_csv(self):
        csv_id = self.csv_select_combo.currentData()
        if not csv_id:
            return

        confirmation = QMessageBox.question(
            self, "Delete CSV", "Are you sure you want to delete this CSV?",
            QMessageBox.Yes | QMessageBox.No, QMessageBox.No
        )

        if confirmation == QMessageBox.Yes:
            headers = {"Authorization": f"Bearer {self.token}"}
            r = requests.delete(f"{API_BASE_URL}/delete-csv/{csv_id}/", headers=headers)

            if r.status_code == 204:
                self.status_label.setText("CSV Deleted Successfully!")
                self.fetch_last_5_csvs()  # Refresh the list after deletion
            else:
                self.status_label.setText("Error deleting CSV!")

    # ---------------------------------------------------------
    # CSV FETCH (Analytics + Equipment List)
    # ---------------------------------------------------------
    def fetch_data(self, csv_id):
        headers = {"Authorization": f"Bearer {self.token}"}

        r = requests.get(f"{API_BASE_URL}/csv/{csv_id}/", headers=headers)

        if r.status_code == 200:
            data = r.json()
            self.display_table(data["equipment_list"])
            self.plot_graphs(data)
        else:
            self.status_label.setText("Fetch error!")

    # ---------------------------------------------------------
    # TABLE DISPLAY
    # ---------------------------------------------------------
    def display_table(self, equipment):
        self.table.setRowCount(len(equipment))
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels(
            ["Equipment Name", "Type", "Flowrate", "Pressure", "Temperature"]
        )

        for r, item in enumerate(equipment):
            self.table.setItem(r, 0, QTableWidgetItem(item["Equipment Name"]))
            self.table.setItem(r, 1, QTableWidgetItem(item["Type"]))
            self.table.setItem(r, 2, QTableWidgetItem(str(item["Flowrate"])))
            self.table.setItem(r, 3, QTableWidgetItem(str(item["Pressure"])))
            self.table.setItem(r, 4, QTableWidgetItem(str(item["Temperature"])))

        self.table.resizeColumnsToContents()

    # ---------------------------------------------------------
    # MATPLOTLIB CHARTS
    # ---------------------------------------------------------
    def plot_graphs(self, data):
        equipment = data["equipment_list"]

        flow = [e["Flowrate"] for e in equipment]
        pressure = [e["Pressure"] for e in equipment]
        temperature = [e["Temperature"] for e in equipment]

        self.figure.clear()
        ax = self.figure.add_subplot(111)
        ax.plot(flow, label="Flowrate")
        ax.plot(pressure, label="Pressure")
        ax.plot(temperature, label="Temperature")

        ax.set_title("Equipment Parameter Trends")
        ax.set_xlabel("Index")
        ax.set_ylabel("Values")
        ax.legend()

        self.canvas.draw()


# ---------------------------------------------------------
# RUN THE APPLICATION
# ---------------------------------------------------------
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DesktopApp()
    window.show()
    sys.exit(app.exec_())
