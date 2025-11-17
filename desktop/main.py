import sys
import os
import requests
import pandas as pd
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QFileDialog, QTableWidget, QTableWidgetItem,
    QComboBox, QMessageBox, QTabWidget, QScrollArea, QGridLayout, QSizePolicy
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont

import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
from matplotlib.backends.backend_pdf import PdfPages

from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import tempfile
import io


API_BASE_URL = "http://127.0.0.1:8000/api"


class DesktopApp(QWidget):
    def __init__(self):
        super().__init__()

        self.token = None
        self.csv_data = []
        self.selected_data = None
        self.figures = []  
        self.current_analysis_data = None

        self.setWindowTitle("Chemical Equipment Visualizer (Desktop)")
        self.setGeometry(100, 50, 1400, 900)  

        self.main_layout = QVBoxLayout()

        
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

        
        self.tabs = QTabWidget()
        
        
        self.upload_tab = QWidget()
        self.setup_upload_tab()
        self.tabs.addTab(self.upload_tab, "Upload")

        
        self.analysis_tab = QWidget()
        self.setup_analysis_tab()
        self.tabs.addTab(self.analysis_tab, "Analysis")

        app_layout.addWidget(self.tabs)

        self.app_widget.setLayout(app_layout)

        
        self.status_label = QLabel("")
        self.status_label.setStyleSheet("font-weight: bold; color: green;")
        self.status_label.setAlignment(Qt.AlignCenter)

        
        self.main_layout.addWidget(self.auth_widget)
        self.main_layout.addWidget(self.app_widget)
        self.main_layout.addWidget(self.status_label)

        self.setLayout(self.main_layout)

    
    
    
    def setup_upload_tab(self):
        layout = QVBoxLayout()

        
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

        
        export_layout = QHBoxLayout()
        self.export_pdf_button = QPushButton("Export Graphs to PDF")
        self.export_pdf_button.clicked.connect(self.export_to_pdf)
        self.export_pdf_button.setEnabled(False)
        self.export_pdf_button.setFixedHeight(40)
        self.export_pdf_button.setStyleSheet("font-size: 14px; font-weight: bold;")
        
        self.export_report_button = QPushButton("Generate Comprehensive Report")
        self.export_report_button.clicked.connect(self.generate_comprehensive_report)
        self.export_report_button.setEnabled(False)
        self.export_report_button.setFixedHeight(40)
        self.export_report_button.setStyleSheet("font-size: 14px; font-weight: bold; background-color: #4CAF50; color: white;")
        
        export_layout.addWidget(self.export_pdf_button)
        export_layout.addWidget(self.export_report_button)
        export_layout.addStretch()
        
        export_widget = QWidget()
        export_widget.setLayout(export_layout)
        layout.addWidget(export_widget)

        
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setMinimumHeight(700)  
        
        self.scroll_content = QWidget()
        self.analysis_layout = QVBoxLayout(self.scroll_content)
        self.analysis_layout.setAlignment(Qt.AlignTop)
        self.analysis_layout.setSpacing(20)  

        self.no_data_label = QLabel("Upload a CSV to see analysis.")
        self.no_data_label.setAlignment(Qt.AlignCenter)
        self.no_data_label.setFont(QFont("Arial", 14))
        self.analysis_layout.addWidget(self.no_data_label)

        scroll.setWidget(self.scroll_content)
        layout.addWidget(scroll)

        
        layout.addWidget(QLabel("Upload History (Last 5):"))
        self.analysis_history_table = QTableWidget()
        self.analysis_history_table.setColumnCount(3)
        self.analysis_history_table.setHorizontalHeaderLabels(["Title", "Uploaded At", "Actions"])
        self.analysis_history_table.horizontalHeader().setStretchLastSection(True)
        self.analysis_history_table.setMaximumHeight(200)
        layout.addWidget(self.analysis_history_table)

        self.analysis_tab.setLayout(layout)

    
    
    
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

                
                self.auth_widget.setVisible(False)
                self.app_widget.setVisible(True)

                
                self.fetch_last_5_csvs()

            else:
                self.status_label.setText("Invalid credentials!")
                self.status_label.setStyleSheet("color: red; font-weight: bold;")

        except Exception as e:
            self.status_label.setText(f"Error: {str(e)}")
            self.status_label.setStyleSheet("color: red; font-weight: bold;")

    def show_register(self):
        
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
                self.tabs.setCurrentIndex(1)  
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
                self.tabs.setCurrentIndex(1)  
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

                    
                    if self.selected_data and self.selected_data.get("id") == csv_id:
                        self.clear_analysis()
                else:
                    self.status_label.setText("Error deleting CSV!")
                    self.status_label.setStyleSheet("color: red; font-weight: bold;")

            except Exception as e:
                self.status_label.setText(f"Error: {str(e)}")
                self.status_label.setStyleSheet("color: red; font-weight: bold;")

    
    
    
    def clear_analysis(self):
        
        while self.analysis_layout.count():
            child = self.analysis_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

        self.no_data_label = QLabel("Upload a CSV to see analysis.")
        self.no_data_label.setAlignment(Qt.AlignCenter)
        self.no_data_label.setFont(QFont("Arial", 14))
        self.analysis_layout.addWidget(self.no_data_label)
        self.selected_data = None
        self.current_analysis_data = None
        self.figures = []
        self.export_pdf_button.setEnabled(False)
        self.export_report_button.setEnabled(False)

    def display_analysis(self, data):
        self.selected_data = data
        self.current_analysis_data = data
        self.figures = []  

        
        while self.analysis_layout.count():
            child = self.analysis_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

        
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

        
        equipment_list = data.get("equipment_list", [])
        equipment_type_dist = data.get("equipment_type_distribution", {})

        if equipment_list:
            
            flowrates = [e["Flowrate"] for e in equipment_list]
            pressures = [e["Pressure"] for e in equipment_list]
            temperatures = [e["Temperature"] for e in equipment_list]
            names = [e["Equipment Name"] for e in equipment_list]

            
            avg_label = QLabel("Average Metrics:")
            avg_label.setFont(QFont("Arial", 12, QFont.Bold))
            self.analysis_layout.addWidget(avg_label)
            avg_chart = self.create_bar_chart(
                ["Flowrate", "Pressure", "Temperature"],
                [data.get("average_flowrate", 0), data.get("average_pressure", 0), data.get("average_temperature", 0)],
                "Average Metrics"
            )
            self.analysis_layout.addWidget(avg_chart)

            
            if equipment_type_dist:
                pie_label = QLabel("Equipment Type Distribution:")
                pie_label.setFont(QFont("Arial", 12, QFont.Bold))
                self.analysis_layout.addWidget(pie_label)
                pie_chart = self.create_pie_chart(equipment_type_dist)
                self.analysis_layout.addWidget(pie_chart)

            
            flowrate_label = QLabel("Flowrate by Equipment:")
            flowrate_label.setFont(QFont("Arial", 12, QFont.Bold))
            self.analysis_layout.addWidget(flowrate_label)
            flowrate_chart = self.create_line_chart(names, flowrates, "Flowrate")
            self.analysis_layout.addWidget(flowrate_chart)

            temp_label = QLabel("Temperature by Equipment:")
            temp_label.setFont(QFont("Arial", 12, QFont.Bold))
            self.analysis_layout.addWidget(temp_label)
            temp_chart = self.create_line_chart(names, temperatures, "Temperature")
            self.analysis_layout.addWidget(temp_chart)

            
            scatter_label = QLabel("Relationship Analysis:")
            scatter_label.setFont(QFont("Arial", 12, QFont.Bold))
            self.analysis_layout.addWidget(scatter_label)
            
            scatter_layout = QHBoxLayout()
            scatter_widget = QWidget()
            scatter_widget.setLayout(scatter_layout)
            
            
            scatter1 = self.create_scatter_chart(flowrates, pressures, "Flowrate vs Pressure", size=(6, 4))
            scatter2 = self.create_scatter_chart(flowrates, temperatures, "Flowrate vs Temperature", size=(6, 4))
            scatter3 = self.create_scatter_chart(pressures, temperatures, "Pressure vs Temperature", size=(6, 4))
            
            scatter_layout.addWidget(scatter1)
            scatter_layout.addWidget(scatter2)
            scatter_layout.addWidget(scatter3)
            
            self.analysis_layout.addWidget(scatter_widget)

            
            table_label = QLabel("Equipment Data:")
            table_label.setFont(QFont("Arial", 12, QFont.Bold))
            self.analysis_layout.addWidget(table_label)
            table = self.create_data_table(equipment_list)
            self.analysis_layout.addWidget(table)

        
        self.export_pdf_button.setEnabled(True)
        self.export_report_button.setEnabled(True)

        self.analysis_layout.addStretch()

    def create_summary_box(self, title, value):
        box = QWidget()
        box.setStyleSheet("background-color: #f0f0f0; border-radius: 10px; padding: 15px; margin: 5px;")
        box.setFixedSize(200, 80)
        layout = QVBoxLayout()

        title_label = QLabel(title)
        title_label.setAlignment(Qt.AlignCenter)
        title_label.setFont(QFont("Arial", 10, QFont.Bold))

        value_label = QLabel(str(value))
        value_label.setAlignment(Qt.AlignCenter)
        value_label.setFont(QFont("Arial", 16, QFont.Bold))

        layout.addWidget(title_label)
        layout.addWidget(value_label)
        box.setLayout(layout)

        return box

    def create_bar_chart(self, labels, values, title):
        figure = Figure(figsize=(10, 6))  
        canvas = FigureCanvas(figure)
        canvas.setMinimumSize(800, 500)
        canvas.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        
        ax = figure.add_subplot(111)
        bars = ax.bar(labels, values, color='skyblue', alpha=0.8)
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_ylabel("Value", fontsize=12)
        ax.grid(True, alpha=0.3)
        
        
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{height:.2f}', ha='center', va='bottom')
        
        figure.tight_layout()
        self.figures.append(figure)  
        return canvas

    def create_pie_chart(self, data_dict):
        figure = Figure(figsize=(8, 6))  
        canvas = FigureCanvas(figure)
        canvas.setMinimumSize(600, 500)
        canvas.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        
        ax = figure.add_subplot(111)
        wedges, texts, autotexts = ax.pie(data_dict.values(), labels=data_dict.keys(), 
                                         autopct='%1.1f%%', startangle=90)
        ax.set_title("Equipment Type Distribution", fontsize=14, fontweight='bold')
        
        
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
        
        figure.tight_layout()
        self.figures.append(figure)  
        return canvas

    def create_line_chart(self, labels, values, ylabel):
        figure = Figure(figsize=(12, 6))  
        canvas = FigureCanvas(figure)
        canvas.setMinimumSize(1000, 500)
        canvas.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        
        ax = figure.add_subplot(111)
        ax.plot(labels, values, marker='o', linewidth=2, markersize=6, alpha=0.8)
        ax.set_title(f"{ylabel} by Equipment", fontsize=14, fontweight='bold')
        ax.set_xlabel("Equipment", fontsize=12)
        ax.set_ylabel(ylabel, fontsize=12)
        ax.tick_params(axis='x', rotation=45)
        ax.grid(True, alpha=0.3)
        figure.tight_layout()
        self.figures.append(figure)  
        return canvas

    def create_scatter_chart(self, x_data, y_data, title, size=(6, 4)):
        figure = Figure(figsize=size)
        canvas = FigureCanvas(figure)
        canvas.setMinimumSize(400, 300)
        canvas.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        
        ax = figure.add_subplot(111)
        scatter = ax.scatter(x_data, y_data, alpha=0.7, s=60, c=x_data, cmap='viridis')
        ax.set_title(title, fontsize=12, fontweight='bold')
        xlabel, ylabel = title.split(" vs ")
        ax.set_xlabel(xlabel, fontsize=10)
        ax.set_ylabel(ylabel, fontsize=10)
        ax.grid(True, alpha=0.3)
         
        plt.colorbar(scatter, ax=ax, label=xlabel)
        
        figure.tight_layout()
        self.figures.append(figure)  
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
        table.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        return table

    
    
    
    def export_to_pdf(self):
        if not self.figures:
            QMessageBox.warning(self, "Export Error", "No graphs available to export!")
            return

        file_path, _ = QFileDialog.getSaveFileName(
            self, "Export Graphs as PDF", "", "PDF Files (*.pdf)"
        )

        if file_path:
            try:
                
                with PdfPages(file_path) as pdf:
                    for figure in self.figures:
                        
                        pdf.savefig(figure, dpi=300, bbox_inches='tight')
                    
                    
                    pdf_info = pdf.infodict()
                    pdf_info['Title'] = 'Chemical Equipment Analysis Graphs'
                    pdf_info['Author'] = 'Chemical Equipment Visualizer'
                    pdf_info['Subject'] = 'Analysis graphs and charts'
                    pdf_info['Keywords'] = 'chemical equipment analysis graphs'
                    pdf_info['CreationDate'] = pd.Timestamp.now()
                    pdf_info['ModDate'] = pd.Timestamp.now()

                QMessageBox.information(self, "Export Successful", 
                                      f"All graphs exported successfully to:\n{file_path}")
                
            except Exception as e:
                QMessageBox.critical(self, "Export Error", 
                                   f"Failed to export PDF:\n{str(e)}")

    def generate_comprehensive_report(self):
        """Generate a comprehensive PDF report with tables and charts"""
        if not self.current_analysis_data:
            QMessageBox.warning(self, "Report Error", "No analysis data available!")
            return

        file_path, _ = QFileDialog.getSaveFileName(
            self, "Save Comprehensive Report", "", "PDF Files (*.pdf)"
        )

        if not file_path:
            return

        try:
            # Create PDF document
            doc = SimpleDocTemplate(file_path, pagesize=A4)
            styles = getSampleStyleSheet()
            story = []

            # Title
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                spaceAfter=30,
                alignment=1,
            )
            title = Paragraph("Chemical Equipment Analysis Report", title_style)
            story.append(title)

            # Report Info
            current_time = pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
            info_text = f"Generated on: {current_time} | Dataset: {self.current_analysis_data.get('title', 'Unknown')}"
            story.append(Paragraph(info_text, styles["Normal"]))
            story.append(Spacer(1, 20))

            # Key Metrics Table
            story.append(Paragraph("Key Metrics", styles["Heading2"]))
            metrics_data = [
                ["Metric", "Value"],
                ["Total Equipment", str(self.current_analysis_data.get('total_count', 0))],
                ["Average Flowrate", f"{self.current_analysis_data.get('average_flowrate', 0):.2f}"],
                ["Average Pressure", f"{self.current_analysis_data.get('average_pressure', 0):.2f}"],
                ["Average Temperature", f"{self.current_analysis_data.get('average_temperature', 0):.2f}"],
            ]
            
            metrics_table = Table(metrics_data, colWidths=[3*inch, 2*inch])
            metrics_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(metrics_table)
            story.append(Spacer(1, 20))

            # Equipment Type Distribution
            equipment_dist = self.current_analysis_data.get('equipment_type_distribution', {})
            if equipment_dist:
                story.append(Paragraph("Equipment Type Distribution", styles["Heading2"]))
                
                dist_data = [["Equipment Type", "Count", "Percentage"]]
                total = sum(equipment_dist.values())
                for eq_type, count in equipment_dist.items():
                    percentage = (count / total) * 100 if total > 0 else 0
                    dist_data.append([eq_type, str(count), f"{percentage:.1f}%"])
                
                dist_table = Table(dist_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
                dist_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                story.append(dist_table)
                story.append(Spacer(1, 20))

            # Save charts as images and add to PDF
            equipment_list = self.current_analysis_data.get('equipment_list', [])
            if equipment_list:
                flowrates = [e.get("Flowrate", 0) for e in equipment_list]
                pressures = [e.get("Pressure", 0) for e in equipment_list]
                temperatures = [e.get("Temperature", 0) for e in equipment_list]
                names = [e.get("Equipment Name", "") for e in equipment_list]

                # Create and save charts as temporary images
                temp_images = []
                
                # Average Metrics Chart
                fig1 = Figure(figsize=(8, 4))
                ax1 = fig1.add_subplot(111)
                bars = ax1.bar(["Flowrate", "Pressure", "Temperature"], 
                              [self.current_analysis_data.get('average_flowrate', 0), 
                               self.current_analysis_data.get('average_pressure', 0), 
                               self.current_analysis_data.get('average_temperature', 0)], 
                              color=['skyblue', 'lightgreen', 'lightcoral'])
                ax1.set_title("Average Metrics")
                ax1.set_ylabel("Value")
                for bar in bars:
                    height = bar.get_height()
                    ax1.text(bar.get_x() + bar.get_width()/2., height,
                            f'{height:.2f}', ha='center', va='bottom')
                
                # Save figure to temporary file
                temp_file1 = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
                fig1.savefig(temp_file1.name, dpi=150, bbox_inches='tight')
                temp_images.append(temp_file1)
                
                story.append(Paragraph("Average Metrics Chart", styles["Heading2"]))
                story.append(Image(temp_file1.name, width=6*inch, height=3*inch))
                story.append(Spacer(1, 10))

                # Equipment Type Distribution Pie Chart
                if equipment_dist:
                    fig2 = Figure(figsize=(6, 4))
                    ax2 = fig2.add_subplot(111)
                    ax2.pie(equipment_dist.values(), labels=equipment_dist.keys(), autopct='%1.1f%%')
                    ax2.set_title("Equipment Type Distribution")
                    
                    temp_file2 = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
                    fig2.savefig(temp_file2.name, dpi=150, bbox_inches='tight')
                    temp_images.append(temp_file2)
                    
                    story.append(Paragraph("Equipment Type Distribution", styles["Heading2"]))
                    story.append(Image(temp_file2.name, width=5*inch, height=3*inch))
                    story.append(Spacer(1, 10))

                # Flowrate Chart
                if len(names) > 0:
                    fig3 = Figure(figsize=(10, 4))
                    ax3 = fig3.add_subplot(111)
                    ax3.plot(names, flowrates, marker='o')
                    ax3.set_title("Flowrate by Equipment")
                    ax3.set_ylabel("Flowrate")
                    ax3.tick_params(axis='x', rotation=45)
                    fig3.tight_layout()
                    
                    temp_file3 = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
                    fig3.savefig(temp_file3.name, dpi=150, bbox_inches='tight')
                    temp_images.append(temp_file3)
                    
                    story.append(Paragraph("Flowrate Analysis", styles["Heading2"]))
                    story.append(Image(temp_file3.name, width=7*inch, height=3*inch))
                    story.append(Spacer(1, 10))

            # Equipment Data Table
            equipment_list = self.current_analysis_data.get('equipment_list', [])
            if equipment_list and len(equipment_list) <= 15:
                story.append(Paragraph("Equipment Data", styles["Heading2"]))
                
                if equipment_list:
                    headers = list(equipment_list[0].keys())
                    table_data = [headers]
                    
                    for item in equipment_list[:10]:
                        row = [str(item.get(header, '')) for header in headers]
                        table_data.append(row)
                    
                    equipment_table = Table(table_data, repeatRows=1)
                    equipment_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 9),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
                        ('FONTSIZE', (0, 1), (-1, -1), 8),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ]))
                    story.append(equipment_table)

            # Build PDF
            doc.build(story)
            
            # Clean up temporary files
            for temp_file in temp_images:
                try:
                    os.unlink(temp_file.name)
                except:
                    pass
            
            QMessageBox.information(self, "Report Generated", 
                                  f"Comprehensive report saved to:\n{file_path}")
            
        except Exception as e:
            QMessageBox.critical(self, "Report Generation Error", 
                               f"Failed to generate report:\n{str(e)}")

 
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DesktopApp()
    window.show()
    sys.exit(app.exec_())