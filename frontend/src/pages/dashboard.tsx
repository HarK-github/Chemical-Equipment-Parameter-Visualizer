import { useEffect, useMemo, useState } from "react";
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
  getKeyValue
} from "@heroui/table";
import {Pagination} from "@heroui/pagination"
import { Button } from "@heroui/button";
import {addToast} from '@heroui/toast'; 
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import {
  LineGraph,
  PieGraph,
  BarGraph,
  ScatterGraph,
} from "../components/Charts";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  
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
      addToast({title:"CSV uploaded! Check the Analysis tab.",color:"success"});
      loadHistory();
    } catch (err) {
      console.log(err);
      alert("Upload failed/Duplicate file");
    }
  };
 
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
      <h1 className="text-2xl md:text-3xl font-semibold text-center">
        Dashboard
      </h1>

      <div className="w-full max-w-6xl flex flex-col justify-center align-middle">
        <Tabs
          variant="underlined"
          aria-label="Upload and Analysis Tabs"
          className="w-full flex justify-center p-[10px]"
        >
          <Tab key="upload" title="Upload" >
            <div className="flex flex-col items-center gap-4 mt-6 md:mt-10 w-full">
              
              <label className="w-full max-w-md flex flex-col items-center px-4 py-6 bg-gray-900 rounded-2xl shadow-md tracking-wide cursor-pointer hover:shadow-xl transition duration-300 border border-gray-200">
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
                  onChange={(e) => setFile(e.target.files[0])}
                />
                </span>

                
              </label>

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

function Analysis({ data }) { 
  console.log(data);
  const equipmentTypes = data.equipment_type_distribution || {};
  const typeLabels = Object.keys(equipmentTypes);
  const typeValues = Object.values(equipmentTypes);
  const flowrateValues = data.equipment_list.map((e) => e["Flowrate"]);
  const temperatureValues = data.equipment_list.map((e) => e["Temperature"]);
  const pressureValues = data.equipment_list.map((e) => e["Pressure"]);
  const equipmentNames = data.equipment_list.map((e) => e["Equipment Name"]);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
 
        <div className="p-3 md:p-4 rounded-xl shadow-md">
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

        {/* Equipment Type Distribution */}
        <div className="p-3 md:p-4 rounded-xl shadow-md">
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
        <div className="p-3 md:p-4 rounded-xl shadow-md">
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

        <div className="p-3 md:p-4 rounded-xl shadow-md">
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
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
        <div className="p-3 md:p-4 rounded-xl shadow-md">
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
        <div className="p-3 md:p-4 rounded-xl shadow-md">
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
        <div className="p-3 md:p-4 rounded-xl shadow-md">
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

     
      <h2 className="text-lg md:text-xl font-semibold mb-3 mt-6 md:mt-8">Equipment Data</h2>
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
            classNames={{ wrapper: "min-h-[222px]" }}
          >
            <TableHeader>
              {columns.map((col) => (
                <TableColumn key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</TableColumn>
              ))}
            </TableHeader>

            <TableBody items={paginatedRows}>
              {(row) => (
                <TableRow key={row["Equipment Name"] || row.id}>
                  {(columnKey) => <TableCell>{getKeyValue(row, columnKey)}</TableCell>}
                </TableRow>
              )}
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

function History({ history, onLoad, onDelete }) {
  if (!history.length)
    return <p className="text-center py-4">No history yet.</p>;

  return (
    <Accordion className="w-full" variant="bordered">
      {history.map((item) => (
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
