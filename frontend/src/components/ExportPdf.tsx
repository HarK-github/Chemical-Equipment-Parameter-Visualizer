import { Button } from "@heroui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import React from "react";

export function ExportPDFButton({ data, chartRefs }) {
  const generatePDF = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Equipment Analysis Report", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        pageWidth / 2,
        yPosition,
        { align: "center" }
      );
      yPosition += 15;

      // Summary Statistics
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary Statistics", 15, yPosition);
      yPosition += 10;

      autoTable(doc, {
        startY: yPosition,
        head: [["Metric", "Value"]],
        body: [
          ["Total Equipment", data?.total_count?.toString() || "0"],
          ["Average Flowrate", (data?.average_flowrate || 0).toFixed(2)],
          ["Average Pressure", (data?.average_pressure || 0).toFixed(2)],
          ["Average Temperature", (data?.average_temperature || 0).toFixed(2)],
        ],
        margin: { left: 15 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // Equipment Type Distribution
      if (data?.equipment_type_distribution && Object.keys(data.equipment_type_distribution).length > 0) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Equipment Type Distribution", 15, yPosition);
        yPosition += 10;

        const equipmentTypes = Object.entries(
          data.equipment_type_distribution
        ).map(([type, count]) => [type, count?.toString() || "0"]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Equipment Type", "Count"]],
          body: equipmentTypes,
          margin: { left: 15 },
          headStyles: { fillColor: [59, 130, 246] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Add charts as images
      if (chartRefs) {
        const charts = [
          { ref: chartRefs.avgMetrics, title: "Average Metrics" },
          { ref: chartRefs.pieChart, title: "Equipment Type Distribution" },
          { ref: chartRefs.flowrateChart, title: "Flowrate by Equipment" },
          { ref: chartRefs.temperatureChart, title: "Temperature by Equipment" },
          {
            ref: chartRefs.flowratePressure,
            title: "Flowrate vs Pressure",
            small: true,
          },
          {
            ref: chartRefs.flowrateTemperature,
            title: "Flowrate vs Temperature",
            small: true,
          },
          {
            ref: chartRefs.pressureTemperature,
            title: "Pressure vs Temperature",
            small: true,
          },
        ].filter(chart => chart.ref?.current);

        for (const chart of charts) {
          doc.addPage();
          yPosition = 20;

          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(chart.title, pageWidth / 2, yPosition, { align: "center" });
          yPosition += 15;

          try {
            const canvas = await html2canvas(chart.ref.current, {
              scale: 2,
              backgroundColor: "#ffffff",
              useCORS: true,
              allowTaint: true,
              logging: false,
            });
            const imgData = canvas.toDataURL("image/png");

            const imgWidth = chart.small ? pageWidth - 60 : pageWidth - 40;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const finalImgHeight = Math.min(imgHeight, pageHeight - yPosition - 20);

            doc.addImage(
              imgData,
              "PNG",
              chart.small ? 30 : 20,
              yPosition,
              imgWidth,
              finalImgHeight
            );
          } catch (error) {
            console.error(`Failed to capture ${chart.title}:`, error);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Chart capture failed", 20, yPosition);
          }
        }
      }

      // Equipment Data Table
      if (data?.equipment_list && data.equipment_list.length > 0) {
        doc.addPage();
        yPosition = 20;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Equipment Data", 15, yPosition);
        yPosition += 10;

        const columns = Object.keys(data.equipment_list[0]);
        const rows = data.equipment_list.map((item) =>
          columns.map((col) => {
            const value = item[col];
            if (value === null || value === undefined) return "N/A";
            if (typeof value === "number") return value.toFixed(2);
            return value.toString();
          })
        );

        autoTable(doc, {
          startY: yPosition,
          head: [columns],
          body: rows,
          margin: { left: 15 },
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: columns.reduce((acc, col, idx) => {
            acc[idx] = { cellWidth: "auto", minCellHeight: 8 };
            return acc;
          }, {}),
          pageBreak: 'auto',
          tableWidth: 'wrap'
        });
      }

      // Save PDF
      const fileName = `Equipment_Analysis_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF report. Please try again.");
    }
  };

  return (
    <Button 
      onPress={generatePDF} 
      className="w-full md:w-auto"
      isDisabled={!data}
    >
      Export PDF Report
    </Button>
  );
}

// Hook version for use in the Analysis component
export function useChartRefs() {
  const avgMetrics = React.useRef(null);
  const pieChart = React.useRef(null);
  const flowrateChart = React.useRef(null);
  const temperatureChart = React.useRef(null);
  const flowratePressure = React.useRef(null);
  const flowrateTemperature = React.useRef(null);
  const pressureTemperature = React.useRef(null);

  return React.useMemo(() => ({
    avgMetrics,
    pieChart,
    flowrateChart,
    temperatureChart,
    flowratePressure,
    flowrateTemperature,
    pressureTemperature,
  }), []);
}