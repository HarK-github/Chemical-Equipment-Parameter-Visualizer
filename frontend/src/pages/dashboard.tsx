/* eslint-disable no-console */
import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Divider } from "@heroui/divider";
import { Accordion, AccordionItem } from "@heroui/accordion";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";

import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import {
  LineGraph,
  PieGraph,
  BarGraph,
  ScatterGraph,
} from "../components/Charts";
import { ExportPDFButton } from "../components/ExportPdf";

interface HistoryItem {
  id: number;
  title: string;
  uploaded_at: string;
}

interface EquipmentData {
  [key: string]: any;
  "Equipment Name": string;
  Flowrate: number;
  Temperature: number;
  Pressure: number;
}

interface SelectedData {
  id: number;
  equipment_type_distribution?: { [key: string]: number };
  equipment_list: EquipmentData[];
  total_count?: number;
  average_flowrate?: number;
  average_pressure?: number;
  average_temperature?: number;
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<SelectedData | null>(null);

  const loadHistory = async () => {
    try {
      const res = await api.get("/api/last5-csv/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });

      setHistory(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const uploadCSV = async () => {
    if (!file) return alert("Select a file first.");

    const formData = new FormData();

    formData.append("title", file.name);
    formData.append("csv_file", file);

    try {
      const res = await api.post("/api/upload-csv/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSelected(res.data);
      addToast({
        title: "CSV uploaded! Check the Analysis tab.",
        color: "success",
      });
      loadHistory();
    } catch (err) {
      console.log(err);
      alert("Upload failed/Duplicate file");
    }
  };

  const loadCSV = async (id: number) => {
    try {
      const res = await api.get(`/api/csv/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });

      setSelected(res.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load file");
    }
  };

  const deleteCSV = async (id: number) => {
    try {
      await api.delete(`/api/delete-csv/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      });
      loadHistory();
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <section className="flex flex-col items-center py-4 md:py-8 px-4">
      <h1 className="text-2xl md:text-3xl font-semibold text-center">
        Dashboard
      </h1>

      <div className="w-full max-w-6xl flex flex-col justify-center align-middle">
        <Tabs
          aria-label="Upload and Analysis Tabs"
          className="w-full flex justify-center p-[10px]"
          variant="underlined"
        >
          <Tab key="upload" title="Upload">
            <div className="flex flex-col items-center gap-4 mt-6 md:mt-10 w-full">
              <div className="w-full max-w-md flex flex-col items-center px-4 py-6 bg-gray-900 rounded-2xl shadow-md tracking-wide cursor-pointer hover:shadow-xl transition duration-300 border border-gray-200">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="mt-2 text-base leading-normal text-gray-500">
                  <input
                    accept=".csv"
                    className="w-full max-w-md"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </span>
              </div>

              <Button className="w-full max-w-md" onPress={uploadCSV}>
                Upload CSV to Cloud
              </Button>
            </div>

            <Divider className="my-4 md:my-6" />
            <History history={history} onDelete={deleteCSV} onLoad={loadCSV} />
          </Tab>
          <Tab key="analysis" title="Analysis">
            {!selected ? (
              <p className="text-center mt-6 md:mt-10">
                Load a CSV to see analysis.
              </p>
            ) : (
              <Analysis data={selected} />
            )}

            <Divider className="my-4 md:my-6" />
            <History history={history} onDelete={deleteCSV} onLoad={loadCSV} />
          </Tab>
        </Tabs>
      </div>
    </section>
  );
}

interface AnalysisProps {
  data: SelectedData;
}

function Analysis({ data }: AnalysisProps) {
  const equipmentTypes = data.equipment_type_distribution || {};
  const typeLabels = Object.keys(equipmentTypes);
  const typeValues = Object.values(equipmentTypes);
  const flowrateValues = data.equipment_list.map(
    (e: EquipmentData) => e["Flowrate"],
  );
  const temperatureValues = data.equipment_list.map(
    (e: EquipmentData) => e["Temperature"],
  );
  const pressureValues = data.equipment_list.map(
    (e: EquipmentData) => e["Pressure"],
  );
  const equipmentNames = data.equipment_list.map(
    (e: EquipmentData) => e["Equipment Name"],
  );
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const paginatedRows = useMemo(() => {
    if (!data.equipment_list) return [];
    const start = (page - 1) * rowsPerPage;

    return data.equipment_list.slice(start, start + rowsPerPage);
  }, [page, data.equipment_list]);

  const metricLabels = ["Flowrate", "Pressure", "Temperature"];
  const metricValues = [
    data.average_flowrate || 0,
    data.average_pressure || 0,
    data.average_temperature || 0,
  ];

  const equipmentList = data.equipment_list || [];
  const totalPages = Math.ceil(equipmentList.length / rowsPerPage);
  const columns = equipmentList[0] ? Object.keys(equipmentList[0]) : [];

  // Enhanced statistics calculations
  const enhancedStats = useMemo(() => {
    if (!equipmentList.length) return null;

    const stats = {
      flowrate: {
        min: Math.min(...flowrateValues),
        max: Math.max(...flowrateValues),
        avg: data.average_flowrate || 0,
        std: calculateStdDev(flowrateValues),
      },
      pressure: {
        min: Math.min(...pressureValues),
        max: Math.max(...pressureValues),
        avg: data.average_pressure || 0,
        std: calculateStdDev(pressureValues),
      },
      temperature: {
        min: Math.min(...temperatureValues),
        max: Math.max(...temperatureValues),
        avg: data.average_temperature || 0,
        std: calculateStdDev(temperatureValues),
      },
      equipmentTypes: typeLabels.length,
      totalEquipment: data.total_count || 0,
    };

    return stats;
  }, [data, equipmentList]);

  const chartRefs = {
    avgMetrics: useRef(null),
    pieChart: useRef(null),
    flowrateChart: useRef(null),
    temperatureChart: useRef(null),
    flowratePressure: useRef(null),
    flowrateTemperature: useRef(null),
    pressureTemperature: useRef(null),
    statsTable: useRef(null),
  };

  return (
    <div className="w-full max-w-6xl overflow-x-hidden">
      {/* Summary Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-6 md:mt-10">
        <Box title="Total Equipment" value={data.total_count || 0} />
        <Box title="Equipment Types" value={typeLabels.length} />
        <EnhancedBox
          subtitle={`Avg: ${(data.average_flowrate || 0).toFixed(1)}`}
          title="Flowrate Range"
          value={
            enhancedStats
              ? `${enhancedStats.flowrate.min.toFixed(1)} - ${enhancedStats.flowrate.max.toFixed(1)}`
              : "N/A"
          }
        />
        <EnhancedBox
          subtitle={`Avg: ${(data.average_temperature || 0).toFixed(1)}`}
          title="Temperature Range"
          value={
            enhancedStats
              ? `${enhancedStats.temperature.min.toFixed(1)} - ${enhancedStats.temperature.max.toFixed(1)}`
              : "N/A"
          }
        />
      </div>

      {/* Enhanced Statistics Table */}
      {enhancedStats && (
        <div ref={chartRefs.statsTable} className="mt-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Detailed Statistics
          </h2>
          <div className="overflow-x-auto">
            <Table removeWrapper aria-label="Detailed Statistics">
              <TableHeader>
                <TableColumn>PARAMETER</TableColumn>
                <TableColumn>MINIMUM</TableColumn>
                <TableColumn>MAXIMUM</TableColumn>
                <TableColumn>AVERAGE</TableColumn>
                <TableColumn>STD DEVIATION</TableColumn>
                <TableColumn>UNIT</TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Flowrate</TableCell>
                  <TableCell>{enhancedStats.flowrate.min.toFixed(2)}</TableCell>
                  <TableCell>{enhancedStats.flowrate.max.toFixed(2)}</TableCell>
                  <TableCell>{enhancedStats.flowrate.avg.toFixed(2)}</TableCell>
                  <TableCell>{enhancedStats.flowrate.std.toFixed(2)}</TableCell>
                  <TableCell>m³/h</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Pressure</TableCell>
                  <TableCell>{enhancedStats.pressure.min.toFixed(2)}</TableCell>
                  <TableCell>{enhancedStats.pressure.max.toFixed(2)}</TableCell>
                  <TableCell>{enhancedStats.pressure.avg.toFixed(2)}</TableCell>
                  <TableCell>{enhancedStats.pressure.std.toFixed(2)}</TableCell>
                  <TableCell>bar</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Temperature</TableCell>
                  <TableCell>
                    {enhancedStats.temperature.min.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {enhancedStats.temperature.max.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {enhancedStats.temperature.avg.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {enhancedStats.temperature.std.toFixed(2)}
                  </TableCell>
                  <TableCell>°C</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex justify-end my-4">
        <ExportPDFButton chartRefs={chartRefs} data={data} />
      </div>

      <Divider className="my-4 md:my-8" />

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div
          ref={chartRefs.avgMetrics}
          className="p-3 md:p-4 rounded-xl shadow-md"
        >
          <h3 className="text-base md:text-lg font-semibold mb-2">
            Average Metrics
          </h3>
          <div className="h-64 md:h-80">
            <BarGraph
              dataPoints={metricValues}
              label="Average"
              labels={metricLabels}
            />
          </div>
        </div>

        <div
          ref={chartRefs.pieChart}
          className="p-3 md:p-4 rounded-xl shadow-md"
        >
          <h3 className="text-base md:text-lg font-semibold mb-2">
            Equipment Type Distribution
          </h3>
          <div className="h-64 md:h-80">
            {typeLabels.length > 0 ? (
              <PieGraph dataPoints={typeValues} labels={typeLabels} />
            ) : (
              <p className="text-gray-500 text-sm md:text-base">
                No equipment type data available
              </p>
            )}
          </div>
        </div>
      </div>

      <Divider className="my-4 md:my-8" />

      {/* Line Graphs */}
      <div className="space-y-6 md:space-y-8">
        <div
          ref={chartRefs.flowrateChart}
          className="p-3 md:p-4 rounded-xl shadow-md"
        >
          <h3 className="text-base md:text-lg font-semibold mb-2">
            Flowrate by Equipment
          </h3>
          <div className="h-64 md:h-80">
            <LineGraph
              dataPoints={flowrateValues}
              label="Flowrate"
              labels={equipmentNames}
            />
          </div>
        </div>

        <div
          ref={chartRefs.temperatureChart}
          className="p-3 md:p-4 rounded-xl shadow-md"
        >
          <h3 className="text-base md:text-lg font-semibold mb-2">
            Temperature by Equipment
          </h3>
          <div className="h-64 md:h-80">
            <LineGraph
              dataPoints={temperatureValues}
              label="Temperature"
              labels={equipmentNames}
            />
          </div>
        </div>
      </div>

      {/* Scatter Plots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
        <div
          ref={chartRefs.flowratePressure}
          className="p-3 md:p-4 rounded-xl shadow-md"
        >
          <h3 className="text-sm md:text-base font-semibold mb-2">
            Flowrate vs Pressure
          </h3>
          <div className="h-48 md:h-64">
            <ScatterGraph
              xData={flowrateValues}
              xLabel="Flowrate"
              yData={pressureValues}
              yLabel="Pressure"
            />
          </div>
        </div>
        <div
          ref={chartRefs.flowrateTemperature}
          className="p-3 md:p-4 rounded-xl shadow-md"
        >
          <h3 className="text-sm md:text-base font-semibold mb-2">
            Flowrate vs Temperature
          </h3>
          <div className="h-48 md:h-64">
            <ScatterGraph
              xData={flowrateValues}
              xLabel="Flowrate"
              yData={temperatureValues}
              yLabel="Temperature"
            />
          </div>
        </div>
        <div
          ref={chartRefs.pressureTemperature}
          className="p-3 md:p-4 rounded-xl shadow-md"
        >
          <h3 className="text-sm md:text-base font-semibold mb-2">
            Pressure vs Temperature
          </h3>
          <div className="h-48 md:h-64">
            <ScatterGraph
              xData={pressureValues}
              xLabel="Pressure"
              yData={temperatureValues}
              yLabel="Temperature"
            />
          </div>
        </div>
      </div>

      <Divider className="my-4 md:my-8" />

      {/* Equipment Data Table */}
      <h2 className="text-lg md:text-xl font-semibold mb-3 mt-6 md:mt-8">
        Equipment Data ({equipmentList.length} items)
      </h2>
      {equipmentList.length ? (
        <div className="overflow-x-auto">
          <Table
            removeWrapper
            aria-label="Full Equipment Data"
            bottomContent={
              <div className="flex w-full justify-center mt-4">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="secondary"
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                />
              </div>
            }
            classNames={{
              wrapper: "min-h-[222px]",
              th: "bg-primary-50 font-semibold",
            }}
          >
            <TableHeader>
              {columns.map((col) => (
                <TableColumn key={col}>{formatColumnHeader(col)}</TableColumn>
              ))}
            </TableHeader>

            <TableBody items={paginatedRows}>
              {(row) => (
                <TableRow
                  key={
                    (row as EquipmentData)["Equipment Name"] || (row as any).id
                  }
                >
                  {(columnKey) => (
                    <TableCell
                      className={getCellClassName(
                        columnKey as string,
                        getKeyValue(row, columnKey),
                      )}
                    >
                      {formatCellValue(
                        columnKey as string,
                        getKeyValue(row, columnKey),
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-gray-500 text-sm md:text-base">
          No CSV data available
        </p>
      )}
    </div>
  );
}

// Helper functions
function calculateStdDev(values: number[]): number {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;

  return Math.sqrt(avgSquareDiff);
}

function formatColumnHeader(column: string): string {
  const formatMap: { [key: string]: string } = {
    "Equipment Name": "Equipment",
    Flowrate: "Flowrate (m³/h)",
    Pressure: "Pressure (bar)",
    Temperature: "Temperature (°C)",
  };

  return formatMap[column] || column;
}

function formatCellValue(column: string, value: any): string {
  if (typeof value === "number") {
    if (["Flowrate", "Pressure", "Temperature"].includes(column)) {
      return value.toFixed(2);
    }

    return value.toString();
  }

  return value;
}

function getCellClassName(column: string, value: any): string {
  if (typeof value === "number") {
    if (column === "Flowrate" && value > 100)
      return "text-success-600 font-medium";
    if (column === "Temperature" && value > 80)
      return "text-warning-600 font-medium";
    if (column === "Pressure" && value > 50)
      return "text-danger-600 font-medium";
  }

  return "";
}

interface EnhancedBoxProps {
  title: string;
  value: string;
  subtitle?: string;
}

function EnhancedBox({ title, value, subtitle }: EnhancedBoxProps) {
  return (
    <div className="p-2 md:p-4 rounded-xl shadow-md text-center">
      <h2 className="text-sm md:text-lg">{title}</h2>
      <p className="text-lg md:text-2xl font-semibold">{value}</p>
      {subtitle && (
        <p className="text-xs md:text-sm text-gray-600 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

interface BoxProps {
  title: string;
  value: number;
}

function Box({ title, value }: BoxProps) {
  return (
    <div className="p-2 md:p-4 rounded-xl shadow-md text-center">
      <h2 className="text-sm md:text-lg">{title}</h2>
      <p className="text-lg md:text-2xl font-semibold">{value}</p>
    </div>
  );
}
interface HistoryProps {
  history: HistoryItem[];
  onLoad: (id: number) => void;
  onDelete: (id: number) => void;
}

function History({ history, onLoad, onDelete }: HistoryProps) {
  if (!history.length)
    return <p className="text-center py-4">No history yet.</p>;

  return (
    <Accordion className="w-full" variant="bordered">
      {history.map((item: HistoryItem) => (
        <AccordionItem
          key={item.id}
          className="text-sm md:text-base"
          title={item.title}
        >
          <p className="text-xs md:text-sm">
            Uploaded: {new Date(item.uploaded_at).toLocaleString()}
          </p>

          <div className="flex gap-2 mt-3 md:mt-4">
            <Button
              className="flex-1 md:flex-none"
              color="primary"
              size="sm"
              onPress={() => onLoad(item.id)}
            >
              Load
            </Button>
            <Button
              className="flex-1 md:flex-none"
              color="danger"
              size="sm"
              variant="flat"
              onPress={() => onDelete(item.id)}
            >
              Delete
            </Button>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
