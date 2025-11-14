import { useEffect, useState } from "react";
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
} from "@heroui/table";
import { Button } from "@heroui/button";

import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { LineGraph, PieGraph, BarGraph ,ScatterGraph} from "../components/Charts";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  // Fetch last 5 CSV uploads
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

  // Upload CSV
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
      loadHistory();
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }
  };

  // Load CSV for analysis
  const loadCSV = async (id) => {
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

  // Delete CSV
  const deleteCSV = async (id) => {
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
      <h1 className="text-2xl md:text-3xl font-semibold text-center">Dashboard</h1>

      <div className="w-full max-w-6xl flex flex-col justify-center align-middle">
        <Tabs aria-label="Upload and Analysis Tabs" variant="solid" className="w-full">
          {/* UPLOAD TAB */}
          <Tab key="upload" title="Upload">
            <div className="flex flex-col items-center gap-4 mt-6 md:mt-10 w-full">
              <input
                accept=".csv"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full max-w-md"
              />

              <Button onPress={uploadCSV} className="w-full max-w-md">
                Upload CSV
              </Button>
            </div>

            <Divider className="my-4 md:my-6" />
            <History history={history} onDelete={deleteCSV} onLoad={loadCSV} />
          </Tab>

          {/* ANALYSIS TAB */}
          <Tab key="analysis" title="Analysis">
            {!selected ? (
              <p className="text-center mt-6 md:mt-10">Upload a CSV to see analysis.</p>
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

function Analysis({ data }) {
  // Equipment type data
  console.log(data);
  const equipmentTypes = data.equipment_type_distribution || {};
  const typeLabels = Object.keys(equipmentTypes);
  const typeValues = Object.values(equipmentTypes);
  const flowrateValues = data.equipment_list.map((e) => e["Flowrate"]);
  const temperatureValues = data.equipment_list.map((e) => e["Temperature"]);
  const pressureValues = data.equipment_list.map((e) => e["Pressure"]);
  const equipmentNames = data.equipment_list.map((e) => e["Equipment Name"]);

  // Average metrics for bar chart
  const metricLabels = ["Flowrate", "Pressure", "Temperature"];
  const metricValues = [
    data.average_flowrate || 0,
    data.average_pressure || 0,
    data.average_temperature || 0,
  ];

  return (
    <div className="w-full max-w-6xl overflow-x-hidden">
      {/* Summary Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-6 md:mt-10">
        <Box title="Total Equipment" value={data.total_count || 0} />
        <Box title="Avg Flowrate" value={data.average_flowrate || 0} />
        <Box title="Avg Pressure" value={data.average_pressure || 0} />
        <Box title="Avg Temperature" value={data.average_temperature || 0} />
      </div>

      <Divider className="my-4 md:my-8" />

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Average Metrics Bar Chart */}
        <div className="p-3 md:p-4 rounded-xl shadow-md">
          <h3 className="text-base md:text-lg font-semibold mb-2">Average Metrics</h3>
          <div className="h-64 md:h-80">
            <BarGraph
              dataPoints={metricValues}
              label="Average"
              labels={metricLabels}
            />
          </div>
        </div>

        {/* Equipment Type Distribution */}
        <div className="p-3 md:p-4 rounded-xl shadow-md">
          <h3 className="text-base md:text-lg font-semibold mb-2">
            Equipment Type Distribution
          </h3>
          <div className="h-64 md:h-80">
            {typeLabels.length > 0 ? (
              <PieGraph dataPoints={typeValues} labels={typeLabels} />
            ) : (
              <p className="text-gray-500 text-sm md:text-base">No equipment type data available</p>
            )}
          </div>
        </div>
      </div>

      <Divider className="my-4 md:my-8" />

      {/* Line Graphs */}
      <div className="space-y-6 md:space-y-8">
        <div className="p-3 md:p-4 rounded-xl shadow-md">
          <h3 className="text-base md:text-lg font-semibold mb-2">Flowrate by Equipment</h3>
          <div className="h-64 md:h-80">
            <LineGraph
              dataPoints={flowrateValues}
              label="Flowrate"
              labels={equipmentNames}
            />
          </div>
        </div>
        
        <div className="p-3 md:p-4 rounded-xl shadow-md">
          <h3 className="text-base md:text-lg font-semibold mb-2">Temperature by Equipment</h3>
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
        <div className="p-3 md:p-4 rounded-xl shadow-md">
          <h3 className="text-sm md:text-base font-semibold mb-2">Flowrate vs Pressure</h3>
          <div className="h-48 md:h-64">
            <ScatterGraph xData={flowrateValues} yData={pressureValues} xLabel="Flowrate" yLabel="Pressure" />
          </div>
        </div>
        <div className="p-3 md:p-4 rounded-xl shadow-md">
          <h3 className="text-sm md:text-base font-semibold mb-2">Flowrate vs Temperature</h3>
          <div className="h-48 md:h-64">
            <ScatterGraph xData={flowrateValues} yData={temperatureValues} xLabel="Flowrate" yLabel="Temperature" />
          </div>
        </div>
        <div className="p-3 md:p-4 rounded-xl shadow-md">
          <h3 className="text-sm md:text-base font-semibold mb-2">Pressure vs Temperature</h3>
          <div className="h-48 md:h-64">
            <ScatterGraph xData={pressureValues} yData={temperatureValues} xLabel="Pressure" yLabel="Temperature" />
          </div>
        </div>
      </div>

      <Divider className="my-4 md:my-8" />

      {/* Equipment Type Table */}
      <h2 className="text-lg md:text-xl font-semibold mb-3">Equipment Types</h2>
      {typeLabels.length > 0 ? (
        <div className="overflow-x-auto">
          <Table removeWrapper aria-label="Type Distribution" className="min-w-full">
            <TableHeader>
              <TableColumn>Equipment Name</TableColumn>
              <TableColumn>Count</TableColumn>
            </TableHeader>
            <TableBody>
              {typeLabels.map((type, index) => (
                <TableRow key={type}>
                  <TableCell>{type}</TableCell>
                  <TableCell>{typeValues[index]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-gray-500 text-sm md:text-base">No equipment type data available</p>
      )}

      {/* Full CSV Table */}
      <h2 className="text-lg md:text-xl font-semibold mb-3 mt-6 md:mt-8">Equipment Data</h2>
      {data.equipment_list && data.equipment_list.length > 0 ? (
        <div className="overflow-x-auto">
          <Table removeWrapper aria-label="Full Equipment Data" className="min-w-full">
            <TableHeader>
              {Object.keys(data.equipment_list[0]).map((key) => (
                <TableColumn key={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {data.equipment_list.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Object.keys(row).map((key) => (
                    <TableCell key={key} className="text-xs md:text-sm">
                      {row[key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-gray-500 text-sm md:text-base">No CSV data available</p>
      )}
    </div>
  );
}

function Box({ title, value }) {
  return (
    <div className="p-2 md:p-4 rounded-xl shadow-md text-center">
      <h2 className="text-sm md:text-lg">{title}</h2>
      <p className="text-lg md:text-2xl font-semibold">{value}</p>
    </div>
  );
}

/* -----------------------------  
    HISTORY LIST 
------------------------------ */

function History({ history, onLoad, onDelete }) {
  if (!history.length) return <p className="text-center py-4">No history yet.</p>;

  return (
    <Accordion variant="bordered" className="w-full">
      {history.map((item) => (
        <AccordionItem key={item.id} title={item.title} className="text-sm md:text-base">
          <p className="text-xs md:text-sm">Uploaded: {new Date(item.uploaded_at).toLocaleString()}</p>

          <div className="flex gap-2 mt-3 md:mt-4">
            <Button color="primary" onPress={() => onLoad(item.id)} size="sm" className="flex-1 md:flex-none">
              Load
            </Button>
            <Button
              color="danger"
              variant="flat"
              onPress={() => onDelete(item.id)}
              size="sm"
              className="flex-1 md:flex-none"
            >
              Delete
            </Button>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  );
}