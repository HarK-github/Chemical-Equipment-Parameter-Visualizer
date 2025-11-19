import { Button } from "@heroui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import React from "react";

export interface UserInfo {
  username: string;
}

// Define types for chart references
export interface ChartRefs {
  avgMetrics?: React.RefObject<HTMLDivElement>;
  pieChart?: React.RefObject<HTMLDivElement>;
  flowrateChart?: React.RefObject<HTMLDivElement>;
  temperatureChart?: React.RefObject<HTMLDivElement>;
  flowratePressure?: React.RefObject<HTMLDivElement>;
  flowrateTemperature?: React.RefObject<HTMLDivElement>;
  pressureTemperature?: React.RefObject<HTMLDivElement>;
}

// Define type for PDF export props
export interface ExportPDFButtonProps {
  user?: UserInfo;
  data: {
    total_count?: number;
    average_flowrate?: number;
    average_pressure?: number;
    average_temperature?: number;
    equipment_type_distribution?: Record<string, number>;
    equipment_list?: Array<Record<string, any>>;
    title?: string;
  };
  chartRefs?: ChartRefs;
}

export function ExportPDFButton({
  data,
  chartRefs,
  user,
}: ExportPDFButtonProps) {
  const generatePDF = async () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Chemical Equipment Analysis Report", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const currentTime = new Date().toLocaleString();
      const datasetTitle = data?.title || "Unknown Dataset";

      doc.text(
        `Generated on: ${currentTime} | Dataset: ${datasetTitle}`,
        pageWidth / 2,
        yPosition,
        { align: "center" },
      );
      yPosition += 15;

      if (user) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Prepared For:", 15, yPosition);
        yPosition += 7;
        doc.setFont("helvetica", "normal");
        doc.text(`Username: ${user.username}`, 15, yPosition);
        yPosition += 10;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Key Metrics", 15, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [["Metric", "Value"]],
        body: [
          ["Total Equipment", data?.total_count?.toString() || "0"],
          ["Average Flowrate", `${(data?.average_flowrate || 0).toFixed(2)}`],
          ["Average Pressure", `${(data?.average_pressure || 0).toFixed(2)}`],
          [
            "Average Temperature",
            `${(data?.average_temperature || 0).toFixed(2)}`,
          ],
        ],
        margin: { left: 15, right: 15 },
        headStyles: {
          fillColor: [128, 128, 128],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: { fillColor: [245, 245, 220] },
        styles: {
          fontSize: 11,
          cellPadding: 6,
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
        },
        theme: "grid",
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;

      if (
        data?.equipment_type_distribution &&
        Object.keys(data.equipment_type_distribution).length > 0
      ) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Equipment Type Distribution", 15, yPosition);
        yPosition += 8;

        const total = Object.values(data.equipment_type_distribution).reduce(
          (sum, count) => sum + count,
          0,
        );
        const distributionData = Object.entries(
          data.equipment_type_distribution,
        ).map(([type, count]) => [
          type,
          count.toString(),
          total > 0 ? `${((count / total) * 100).toFixed(1)}%` : "0%",
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [["Equipment Type", "Count", "Percentage"]],
          body: distributionData,
          margin: { left: 15, right: 15 },
          headStyles: {
            fillColor: [173, 216, 230],
            textColor: [0, 0, 0],
          },
          styles: {
            fontSize: 10,
            cellPadding: 5,
          },
          theme: "grid",
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      if (chartRefs) {
        const charts = [
          {
            ref: chartRefs.avgMetrics,
            title: "Average Metrics Chart",
            size: "medium",
          },
          {
            ref: chartRefs.pieChart,
            title: "Equipment Type Distribution",
            size: "medium",
          },
          {
            ref: chartRefs.flowrateChart,
            title: "Flowrate Analysis",
            size: "large",
          },
          {
            ref: chartRefs.temperatureChart,
            title: "Temperature Analysis",
            size: "large",
          },
          {
            ref: chartRefs.flowratePressure,
            title: "Flowrate vs Pressure",
            size: "small",
          },
          {
            ref: chartRefs.flowrateTemperature,
            title: "Flowrate vs Temperature",
            size: "small",
          },
          {
            ref: chartRefs.pressureTemperature,
            title: "Pressure vs Temperature",
            size: "small",
          },
        ].filter((chart) => chart.ref?.current);

        for (const chart of charts) {
          if (yPosition > pageHeight - 100) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(chart.title, 15, yPosition);
          yPosition += 8;

          let chartCaptured = false;

          try {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const canvas = await html2canvas(chart.ref!.current!, {
              scale: 1.5, 
              backgroundColor: "#ffffff",
              useCORS: true,
              allowTaint: false, 
              logging: false,
              onclone: (clonedDoc) => {
                const chartElement = clonedDoc.querySelector(
                  `[data-chart="${chart.title}"]`,
                );

                if (chartElement) {
                  (chartElement as HTMLElement).style.opacity = "1";
                }
              },
            });

            let imgWidth, imgHeight;
            const maxWidth = pageWidth - 30;
            const aspectRatio = canvas.height / canvas.width;

            switch (chart.size) {
              case "small":
                imgWidth = maxWidth * 0.6;
                break;
              case "medium":
                imgWidth = maxWidth * 0.8;
                break;
              case "large":
              default:
                imgWidth = maxWidth;
                break;
            }

            imgHeight = imgWidth * aspectRatio;

            const maxHeight = pageHeight - yPosition - 20;

            if (imgHeight > maxHeight) {
              imgHeight = maxHeight;
              imgWidth = imgHeight / aspectRatio;
            }

            const xPosition = (pageWidth - imgWidth) / 2;

            const imgData = canvas.toDataURL("image/png", 0.8);

            doc.addImage(
              imgData,
              "PNG",
              xPosition,
              yPosition,
              imgWidth,
              imgHeight,
            );

            yPosition += imgHeight + 15;
            chartCaptured = true;
          } catch (error) {
            console.error(`Failed to capture ${chart.title}:`, error);
            chartCaptured = false;
          }

          if (!chartCaptured) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.text(
              "Chart preview unavailable - refer to web application for interactive charts",
              15,
              yPosition,
            );
            yPosition += 8;

            if (chart.title.includes("Average Metrics")) {
              const avgData = [
                ["Metric", "Value"],
                ["Flowrate", `${data?.average_flowrate?.toFixed(2)}`],
                ["Pressure", `${data?.average_pressure?.toFixed(2)}`],
                ["Temperature", `${data?.average_temperature?.toFixed(2)}`],
              ];

              autoTable(doc, {
                startY: yPosition,
                body: avgData,
                margin: { left: 15 },
                styles: { fontSize: 9, cellPadding: 3 },
                theme: "grid",
              });
              yPosition = (doc as any).lastAutoTable.finalY + 10;
            } else if (
              chart.title.includes("Equipment Type Distribution") &&
              data?.equipment_type_distribution
            ) {
              const distData = Object.entries(
                data.equipment_type_distribution,
              ).map(([type, count]) => [type, count.toString()]);

              autoTable(doc, {
                startY: yPosition,
                head: [["Equipment Type", "Count"]],
                body: distData,
                margin: { left: 15 },
                styles: { fontSize: 9, cellPadding: 3 },
                theme: "grid",
              });
              yPosition = (doc as any).lastAutoTable.finalY + 10;
            } else if (
              chart.title.includes("Flowrate Analysis") &&
              data?.equipment_list
            ) {
              const flowrateData = data.equipment_list
                .slice(0, 10)
                .map((item) => [
                  item.Equipment_Name || item.name || "Unknown",
                  item.Flowrate?.toFixed(2) || "0.00",
                ]);

              autoTable(doc, {
                startY: yPosition,
                head: [["Equipment", "Flowrate"]],
                body: flowrateData,
                margin: { left: 15 },
                styles: { fontSize: 8, cellPadding: 2 },
                theme: "grid",
              });
              yPosition = (doc as any).lastAutoTable.finalY + 10;
            } else if (
              chart.title.includes("Temperature Analysis") &&
              data?.equipment_list
            ) {
              const tempData = data.equipment_list
                .slice(0, 10)
                .map((item) => [
                  item.Equipment_Name || item.name || "Unknown",
                  item.Temperature?.toFixed(2) || "0.00",
                ]);

              autoTable(doc, {
                startY: yPosition,
                head: [["Equipment", "Temperature"]],
                body: tempData,
                margin: { left: 15 },
                styles: { fontSize: 8, cellPadding: 2 },
                theme: "grid",
              });
              yPosition = (doc as any).lastAutoTable.finalY + 10;
            }

            yPosition += 5;
          }
        }
      }

      if (data?.equipment_list && data.equipment_list.length > 0) {
        if (yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Equipment Data Summary", 15, yPosition);
        yPosition += 8;

        const equipmentToShow = data.equipment_list.slice(0, 15);
        const headers = Object.keys(equipmentToShow[0])
          .filter(
            (key) =>
              !key.toLowerCase().includes("id") &&
              key !== "created_at" &&
              key !== "updated_at",
          )
          .slice(0, 6);
        const tableData = equipmentToShow.map((item) =>
          headers.map((header) => {
            const value = item[header];

            if (value === null || value === undefined) return "N/A";
            if (typeof value === "number") return value.toFixed(2);

            return value.toString();
          }),
        );

        autoTable(doc, {
          startY: yPosition,
          head: [headers],
          body: tableData,
          margin: { left: 15, right: 15 },
          headStyles: {
            fillColor: [25, 25, 112],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          bodyStyles: { fillColor: [211, 211, 211] },
          styles: {
            fontSize: 7,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.3,
          },
          theme: "grid",
          tableWidth: "auto",
        });

        if (data.equipment_list.length > 15) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "italic");
          doc.text(
            `Note: Showing first 15 of ${data.equipment_list.length} equipment items`,
            15,
            (doc as any).lastAutoTable.finalY + 5,
          );
        }
      }

      doc.addPage();
      yPosition = 20;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Report Information", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const infoLines = [
        "Generated by: Chemical Equipment Analysis Tool By HarshitKandpal",
      ];

      infoLines.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });

      const fileName = `Chemical_Equipment_Analysis_${new Date()
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
      className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-700"
      isDisabled={!data}
      onPress={generatePDF}
    >
      Export Comprehensive PDF Report
    </Button>
  );
}

export function useChartRefs(): ChartRefs {
  const avgMetrics = React.useRef<HTMLDivElement>(null);
  const pieChart = React.useRef<HTMLDivElement>(null);
  const flowrateChart = React.useRef<HTMLDivElement>(null);
  const temperatureChart = React.useRef<HTMLDivElement>(null);
  const flowratePressure = React.useRef<HTMLDivElement>(null);
  const flowrateTemperature = React.useRef<HTMLDivElement>(null);
  const pressureTemperature = React.useRef<HTMLDivElement>(null);

  return React.useMemo(
    () => ({
      avgMetrics,
      pieChart,
      flowrateChart,
      temperatureChart,
      flowratePressure,
      flowrateTemperature,
      pressureTemperature,
    }),
    [],
  );
}
