import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie, Scatter } from "react-chartjs-2";

// Register all required components
ChartJs.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // Make sure ArcElement is registered
);

// Define prop types for each chart component
interface LineGraphProps {
  labels: string[];
  dataPoints: number[];
  label: string;
}

interface BarGraphProps {
  labels: string[];
  dataPoints: number[];
  label: string;
}

interface PieGraphProps {
  labels: string[];
  dataPoints: number[];
}

interface ScatterGraphProps {
  xData: number[];
  yData: number[];
  xLabel: string;
  yLabel: string;
}

// Line Chart Component
const LineGraph = ({ labels, dataPoints, label }: LineGraphProps) => {
  const data = {
    labels,
    datasets: [
      {
        label: label || "Trend",
        data: dataPoints,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" as const } },
  };

  return <Line data={data} options={options} />;
};

// Bar Chart Component
const BarGraph = ({ labels, dataPoints, label }: BarGraphProps) => {
  const data = {
    labels,
    datasets: [
      {
        label: label || "Bar Chart",
        data: dataPoints,
        backgroundColor: "rgba(53,162,235,0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" as const } },
  };

  return <Bar data={data} options={options} />;
};

// Pie Chart Component
const PieGraph = ({ labels, dataPoints }: PieGraphProps) => {
  const data = {
    labels,
    datasets: [
      {
        label: "Distribution",
        data: dataPoints,
        backgroundColor: [
          "rgba(255,99,132,0.6)",
          "rgba(54,162,235,0.6)",
          "rgba(255,206,86,0.6)",
          "rgba(75,192,192,0.6)",
        ],
      },
    ],
  };

  return <Pie data={data} />;
};

// Scatter Chart Component
function ScatterGraph({ xData, yData, xLabel, yLabel }: ScatterGraphProps) {
  const data = {
    datasets: [
      {
        label: `${yLabel} vs ${xLabel}`,
        data: xData.map((x: number, i: number) => ({ x, y: yData[i] })),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: xLabel } },
      y: { title: { display: true, text: yLabel } },
    },
  };

  return <Scatter data={data} options={options} />;
}

export { LineGraph, PieGraph, BarGraph, ScatterGraph };