import sys
import requests
import pandas as pd
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QFileDialog, QTableWidget, QTableWidgetItem,
    QComboBox, QMessageBox, QTabWidget, QScrollArea, QGridLayout
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont

import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure


API_BASE_URL = "http://127.0.0.1:8000/api"


class DesktopApp(QWidget):
    def __init__(self):
        super().__init__()

        self.token = None
        self.csv_data = []
        self.selected_data = None

        self.setWindowTitle("Chemical Equipment Visualizer (Desktop)")
        self.setGeometry(100, 50, 1200, 800)

        self.main_layout = QVBoxLayout()

        # ------------------ AUTH UI ------------------
        self.auth_widget = QWidget()
        auth_layout = QVBoxLayout()

        self.login_label = QLabel("Login Required")
        self.login_label.setFont(QFont("Arial", 16, QFont.Bold))
        self.login_label.setAlignment(Qt.AlignCenter)

        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Username")
        self.username_input.setMaximumWidth(400)

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        self.password_input.setMaximumWidth(400)

        self.login_button = QPushButton("Login")
        self.login_button.clicked.connect(self.login)
        self.login_button.setMaximumWidth(400)

        self.register_button = QPushButton("Register")
        self.register_button.clicked.connect(self.show_register)
        self.register_button.setMaximumWidth(400)

        auth_layout.addStretch()
        auth_layout.addWidget(self.login_label, alignment=Qt.AlignCenter)
        auth_layout.addWidget(self.username_input, alignment=Qt.AlignCenter)
        auth_layout.addWidget(self.password_input, alignment=Qt.AlignCenter)
        auth_layout.addWidget(self.login_button, alignment=Qt.AlignCenter)
        auth_layout.addWidget(self.register_button, alignment=Qt.AlignCenter)
        auth_layout.addStretch()

        self.auth_widget.setLayout(auth_layout)
        self.app_widget = QWidget()
        self.app_widget.setVisible(False)
        app_layout = QVBoxLayout()

        # Tab Widget
        self.tabs = QTabWidget()
        
        # Upload Tab
        self.upload_tab = QWidget()
        self.setup_upload_tab()
        self.tabs.addTab(self.upload_tab, "Upload")

        # Analysis Tab
        self.analysis_tab = QWidget()
        self.setup_analysis_tab()
        self.tabs.addTab(self.analysis_tab, "Analysis")

        app_layout.addWidget(self.tabs)

        self.app_widget.setLayout(app_layout)

        # Status Label
        self.status_label = QLabel("")
        self.status_label.setStyleSheet("font-weight: bold; color: green;")
        self.status_label.setAlignment(Qt.AlignCenter)

        # Add widgets to main layout
        self.main_layout.addWidget(self.auth_widget)
        self.main_layout.addWidget(self.app_widget)
        self.main_layout.addWidget(self.status_label)

        self.setLayout(self.main_layout)

    # ---------------------------------------------------------
    # SETUP TABS
    # ---------------------------------------------------------
    def setup_upload_tab(self):
        layout = QVBoxLayout()

        # Upload Section
        upload_section = QWidget()
        upload_layout = QVBoxLayout()

        self.file_label = QLabel("No file selected")
        self.select_file_button = QPushButton("Select CSV File")
        self.select_file_button.clicked.connect(self.select_csv)

        self.upload_button = QPushButton("Upload CSV")
        self.upload_button.clicked.connect(self.upload_csv)
        self.upload_button.setEnabled(False)

        upload_layout.addWidget(QLabel("Upload CSV File:"))
        upload_layout.addWidget(self.file_label)
        upload_layout.addWidget(self.select_file_button)
        upload_layout.addWidget(self.upload_button)

        upload_section.setLayout(upload_layout)
        layout.addWidget(upload_section)

        # History Section
        layout.addWidget(QLabel("Upload History (Last 5):"))
        self.history_table = QTableWidget()
        self.history_table.setColumnCount(3)
        self.history_table.setHorizontalHeaderLabels(["Title", "Uploaded At", "Actions"])
        self.history_table.horizontalHeader().setStretchLastSection(True)
        layout.addWidget(self.history_table)

        layout.addStretch()
        self.upload_tab.setLayout(layout)

    def setup_analysis_tab(self):
        layout = QVBoxLayout()

        # Scroll area for analysis content
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll_content = QWidget()
        self.analysis_layout = QVBoxLayout()

        self.no_data_label = QLabel("Upload a CSV to see analysis.")
        self.no_data_label.setAlignment(Qt.AlignCenter)
        self.no_data_label.setFont(QFont("Arial", 14))
        self.analysis_layout.addWidget(self.no_data_label)

        scroll_content.setLayout(self.analysis_layout)
        scroll.setWidget(scroll_content)
        layout.addWidget(scroll)

        # History Section at bottom
        layout.addWidget(QLabel("Upload History (Last 5):"))
        self.analysis_history_table = QTableWidget()
        self.analysis_history_table.setColumnCount(3)
        self.analysis_history_table.setHorizontalHeaderLabels(["Title", "Uploaded At", "Actions"])
        self.analysis_history_table.horizontalHeader().setStretchLastSection(True)
        self.analysis_history_table.setMaximumHeight(200)
        layout.addWidget(self.analysis_history_table)

        self.analysis_tab.setLayout(layout)

    # ---------------------------------------------------------
    # AUTH
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
                self.status_label.setStyleSheet("color: green; font-weight: bold;")

                # Hide auth, show app
                self.auth_widget.setVisible(False)
                self.app_widget.setVisible(True)

                # Fetch last 5 CSVs
                self.fetch_last_5_csvs()

            else:
                self.status_label.setText("Invalid credentials!")
                self.status_label.setStyleSheet("color: red; font-weight: bold;")

        except Exception as e:
            self.status_label.setText(f"Error: {str(e)}")
            self.status_label.setStyleSheet("color: red; font-weight: bold;")

    def show_register(self):
        # Simple registration dialog
        from PyQt5.QtWidgets import QDialog, QDialogButtonBox

        dialog = QDialog(self)
        dialog.setWindowTitle("Register")
        dialog_layout = QVBoxLayout()

        username_input = QLineEdit()
        username_input.setPlaceholderText("Username")
        password_input = QLineEdit()
        password_input.setPlaceholderText("Password")
        password_input.setEchoMode(QLineEdit.Password)

        dialog_layout.addWidget(QLabel("Username:"))
        dialog_layout.addWidget(username_input)
        dialog_layout.addWidget(QLabel("Password:"))
        dialog_layout.addWidget(password_input)

        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(dialog.accept)
        buttons.rejected.connect(dialog.reject)
        dialog_layout.addWidget(buttons)

        dialog.setLayout(dialog_layout)

        if dialog.exec_() == QDialog.Accepted:
            try:
                response = requests.post(
                    f"{API_BASE_URL}/user/register/",
                    json={"username": username_input.text(), "password": password_input.text()}
                )

                if response.status_code == 201:
                    QMessageBox.information(self, "Success", "Registration successful! Please login.")
                else:
                    QMessageBox.warning(self, "Error", "Registration failed!")

            except Exception as e:
                QMessageBox.critical(self, "Error", str(e))

    # ---------------------------------------------------------
    # CSV OPERATIONS
    # ---------------------------------------------------------
    def fetch_last_5_csvs(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        try:
            r = requests.get(f"{API_BASE_URL}/last5-csv/", headers=headers)

            if r.status_code == 200:
                self.csv_data = r.json()
                self.populate_history_table(self.history_table)
                self.populate_history_table(self.analysis_history_table)
            else:
                self.status_label.setText("Error fetching CSVs!")
                self.status_label.setStyleSheet("color: red; font-weight: bold;")

        except Exception as e:
            self.status_label.setText(f"Error: {str(e)}")
            self.status_label.setStyleSheet("color: red; font-weight: bold;")

    def populate_history_table(self, table):
        table.setRowCount(len(self.csv_data))

        for row, csv in enumerate(self.csv_data):
            table.setItem(row, 0, QTableWidgetItem(csv["title"]))
            table.setItem(row, 1, QTableWidgetItem(csv["uploaded_at"]))

            # Action buttons
            action_widget = QWidget()
            action_layout = QHBoxLayout()
            action_layout.setContentsMargins(0, 0, 0, 0)

            load_btn = QPushButton("Load")
            load_btn.clicked.connect(lambda checked, csv_id=csv["id"]: self.load_csv(csv_id))

            delete_btn = QPushButton("Delete")
            delete_btn.clicked.connect(lambda checked, csv_id=csv["id"]: self.delete_csv(csv_id))

            action_layout.addWidget(load_btn)
            action_layout.addWidget(delete_btn)
            action_widget.setLayout(action_layout)

            table.setCellWidget(row, 2, action_widget)

    def select_csv(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select CSV", "", "CSV Files (*.csv)")
        if file_path:
            self.selected_file = file_path
            self.file_label.setText(file_path.split("/")[-1])
            self.upload_button.setEnabled(True)

    def upload_csv(self):
        if not hasattr(self, 'selected_file'):
            return

        headers = {"Authorization": f"Bearer {self.token}"}
        files = {"csv_file": open(self.selected_file, "rb")}
        data = {"title": self.selected_file.split("/")[-1]}

        try:
            r = requests.post(f"{API_BASE_URL}/upload-csv/", files=files, data=data, headers=headers)

            if r.status_code == 201:
                self.status_label.setText("CSV Upload Successful!")
                self.status_label.setStyleSheet("color: green; font-weight: bold;")
                csv_data = r.json()
                self.fetch_last_5_csvs()
                self.display_analysis(csv_data)
                self.tabs.setCurrentIndex(1)  # Switch to Analysis tab
            else:
                msg = r.json().get("detail", "Upload failed")
                self.status_label.setText(f"Error: {msg}")
                self.status_label.setStyleSheet("color: red; font-weight: bold;")

        except Exception as e:
            self.status_label.setText(f"Error: {str(e)}")
            self.status_label.setStyleSheet("color: red; font-weight: bold;")

    def load_csv(self, csv_id):
        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            r = requests.get(f"{API_BASE_URL}/csv/{csv_id}/", headers=headers)

            if r.status_code == 200:
                data = r.json()
                self.display_analysis(data)
                self.tabs.setCurrentIndex(1)  # Switch to Analysis tab
            else:
                self.status_label.setText("Fetch error!")
                self.status_label.setStyleSheet("color: red; font-weight: bold;")

        except Exception as e:
            self.status_label.setText(f"Error: {str(e)}")
            self.status_label.setStyleSheet("color: red; font-weight: bold;")

    def delete_csv(self, csv_id):
        confirmation = QMessageBox.question(
            self, "Delete CSV", "Are you sure you want to delete this CSV?",
            QMessageBox.Yes | QMessageBox.No, QMessageBox.No
        )

        if confirmation == QMessageBox.Yes:
            headers = {"Authorization": f"Bearer {self.token}"}

            try:
                r = requests.delete(f"{API_BASE_URL}/delete-csv/{csv_id}/", headers=headers)

                if r.status_code == 204:
                    self.status_label.setText("CSV Deleted Successfully!")
                    self.status_label.setStyleSheet("color: green; font-weight: bold;")
                    self.fetch_last_5_csvs()

                    # Clear analysis if the deleted CSV was being displayed
                    if self.selected_data and self.selected_data.get("id") == csv_id:
                        self.clear_analysis()
                else:
                    self.status_label.setText("Error deleting CSV!")
                    self.status_label.setStyleSheet("color: red; font-weight: bold;")

            except Exception as e:
                self.status_label.setText(f"Error: {str(e)}")
                self.status_label.setStyleSheet("color: red; font-weight: bold;")

    # ---------------------------------------------------------
    # ANALYSIS DISPLAY
    # ---------------------------------------------------------
    def clear_analysis(self):
        # Clear existing widgets
        while self.analysis_layout.count():
            child = self.analysis_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

        self.no_data_label = QLabel("Upload a CSV to see analysis.")
        self.no_data_label.setAlignment(Qt.AlignCenter)
        self.no_data_label.setFont(QFont("Arial", 14))
        self.analysis_layout.addWidget(self.no_data_label)
        self.selected_data = None

    def display_analysis(self, data):
        self.selected_data = data

        # Clear existing widgets
        while self.analysis_layout.count():
            child = self.analysis_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

        # Summary boxes
        summary_widget = QWidget()
        summary_layout = QGridLayout()

        boxes = [
            ("Total Equipment", data.get("total_count", 0)),
            ("Avg Flowrate", f"{data.get('average_flowrate', 0):.2f}"),
            ("Avg Pressure", f"{data.get('average_pressure', 0):.2f}"),
            ("Avg Temperature", f"{data.get('average_temperature', 0):.2f}"),
        ]

        for i, (title, value) in enumerate(boxes):
            box = self.create_summary_box(title, str(value))
            summary_layout.addWidget(box, 0, i)

        summary_widget.setLayout(summary_layout)
        self.analysis_layout.addWidget(summary_widget)

        # Charts
        equipment_list = data.get("equipment_list", [])
        equipment_type_dist = data.get("equipment_type_distribution", {})

        if equipment_list:
            # Prepare data
            flowrates = [e["Flowrate"] for e in equipment_list]
            pressures = [e["Pressure"] for e in equipment_list]
            temperatures = [e["Temperature"] for e in equipment_list]
            names = [e["Equipment Name"] for e in equipment_list]

            # Average metrics bar chart
            self.analysis_layout.addWidget(QLabel("Average Metrics:"))
            avg_chart = self.create_bar_chart(
                ["Flowrate", "Pressure", "Temperature"],
                [data.get("average_flowrate", 0), data.get("average_pressure", 0), data.get("average_temperature", 0)],
                "Average Metrics"
            )
            self.analysis_layout.addWidget(avg_chart)

            # Equipment type pie chart
            if equipment_type_dist:
                self.analysis_layout.addWidget(QLabel("Equipment Type Distribution:"))
                pie_chart = self.create_pie_chart(equipment_type_dist)
                self.analysis_layout.addWidget(pie_chart)

            # Line charts
            self.analysis_layout.addWidget(QLabel("Flowrate by Equipment:"))
            flowrate_chart = self.create_line_chart(names, flowrates, "Flowrate")
            self.analysis_layout.addWidget(flowrate_chart)

            self.analysis_layout.addWidget(QLabel("Temperature by Equipment:"))
            temp_chart = self.create_line_chart(names, temperatures, "Temperature")
            self.analysis_layout.addWidget(temp_chart)

            # Scatter plots
            scatter_layout = QHBoxLayout()
            scatter_layout.addWidget(self.create_scatter_chart(flowrates, pressures, "Flowrate vs Pressure"))
            scatter_layout.addWidget(self.create_scatter_chart(flowrates, temperatures, "Flowrate vs Temperature"))
            scatter_layout.addWidget(self.create_scatter_chart(pressures, temperatures, "Pressure vs Temperature"))

            scatter_widget = QWidget()
            scatter_widget.setLayout(scatter_layout)
            self.analysis_layout.addWidget(scatter_widget)

            # Equipment data table
            self.analysis_layout.addWidget(QLabel("Equipment Data:"))
            table = self.create_data_table(equipment_list)
            self.analysis_layout.addWidget(table)

        self.analysis_layout.addStretch()

    def create_summary_box(self, title, value):
        box = QWidget()
        box.setStyleSheet("background-color: #f0f0f0; border-radius: 10px; padding: 10px;")
        layout = QVBoxLayout()

        title_label = QLabel(title)
        title_label.setAlignment(Qt.AlignCenter)
        title_label.setFont(QFont("Arial", 10))

        value_label = QLabel(str(value))
        value_label.setAlignment(Qt.AlignCenter)
        value_label.setFont(QFont("Arial", 16, QFont.Bold))

        layout.addWidget(title_label)
        layout.addWidget(value_label)
        box.setLayout(layout)

        return box

    def create_bar_chart(self, labels, values, title):
        figure = Figure(figsize=(8, 4))
        canvas = FigureCanvas(figure)
        ax = figure.add_subplot(111)
        ax.bar(labels, values, color='skyblue')
        ax.set_title(title)
        ax.set_ylabel("Value")
        figure.tight_layout()
        return canvas

    def create_pie_chart(self, data_dict):
        figure = Figure(figsize=(6, 4))
        canvas = FigureCanvas(figure)
        ax = figure.add_subplot(111)
        ax.pie(data_dict.values(), labels=data_dict.keys(), autopct='%1.1f%%')
        ax.set_title("Equipment Type Distribution")
        figure.tight_layout()
        return canvas

    def create_line_chart(self, labels, values, ylabel):
        figure = Figure(figsize=(10, 4))
        canvas = FigureCanvas(figure)
        ax = figure.add_subplot(111)
        ax.plot(labels, values, marker='o')
        ax.set_title(f"{ylabel} by Equipment")
        ax.set_xlabel("Equipment")
        ax.set_ylabel(ylabel)
        ax.tick_params(axis='x', rotation=45)
        figure.tight_layout()
        return canvas

    def create_scatter_chart(self, x_data, y_data, title):
        figure = Figure(figsize=(4, 3))
        canvas = FigureCanvas(figure)
        ax = figure.add_subplot(111)
        ax.scatter(x_data, y_data, alpha=0.6)
        ax.set_title(title)
        xlabel, ylabel = title.split(" vs ")
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        figure.tight_layout()
        return canvas

    def create_data_table(self, equipment_list):
        table = QTableWidget()
        table.setRowCount(len(equipment_list))
        
        if equipment_list:
            columns = list(equipment_list[0].keys())
            table.setColumnCount(len(columns))
            table.setHorizontalHeaderLabels(columns)

            for row, item in enumerate(equipment_list):
                for col, key in enumerate(columns):
                    table.setItem(row, col, QTableWidgetItem(str(item[key])))

        table.resizeColumnsToContents()
        table.setMaximumHeight(400)
        return table


# ---------------------------------------------------------
# RUN THE APPLICATION
# ---------------------------------------------------------
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DesktopApp()
    window.show()
    sys.exit(app.exec_())