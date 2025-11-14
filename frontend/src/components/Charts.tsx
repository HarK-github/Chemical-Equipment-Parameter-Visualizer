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
  ArcElement
} from "chart.js";
import { Line, Bar, Pie,Scatter } from "react-chartjs-2";

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
  ArcElement  // Make sure ArcElement is registered
);

// Line Chart Component
const LineGraph = ({ labels, dataPoints, label }) => {
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
    plugins: { legend: { position: "top" } },
  };

  return <Line data={data} options={options} />;
};

// Bar Chart Component
const BarGraph = ({ labels, dataPoints, label }) => {
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
    plugins: { legend: { position: "top" } },
  };

  return <Bar data={data} options={options} />;
};

// Pie Chart Component
const PieGraph = ({ labels, dataPoints }) => {
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

function ScatterGraph({ xData, yData, xLabel, yLabel }) {
  const data = {
    datasets: [
      {
        label: `${yLabel} vs ${xLabel}`,
        data: xData.map((x, i) => ({ x, y: yData[i] })),
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


export { LineGraph, PieGraph, BarGraph,ScatterGraph };