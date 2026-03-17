"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { getWorksheetData, uploadWorksheet } from "@/app/services/auth.service";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import * as XLSX from "xlsx";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import CommonButton from "@/app/components/Button";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  estimationHours: number;
  actualHours: number;
  created_at: string;
}

interface WorksheetData {
  date: string;
  tasks: Task[];
}

export default function WorksheetPage() {
  const [data, setData] = useState<WorksheetData[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [importData, setImportData] = useState<any[]>([]);
  const [modelOpen, setModelOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchWorksheetData = async () => {
    try {
      const response = await getWorksheetData(month, year);
      setData(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWorksheetData();
  }, [month, year]);

  const columns: ColumnDef<Task>[] = [
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Status",
      accessorKey: "status",
    },
    {
      header: "Estimated Hours",
      accessorKey: "estimationHours",
    },
    {
      header: "Actual Hours",
      accessorKey: "actualHours",
    },
  ];

  function TaskTable({ data }: { data: Task[] }) {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <table className="min-w-full bg-white shadow rounded mt-2">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-2 text-left bg-gray-100 text-xs"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 text-xs">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const exportToExcel = () => {
    const rows: any[] = [];

    data.forEach((day) => {
      day.tasks.forEach((task) => {
        rows.push({
          Date: day.date,
          Title: task.title,
          Description: task.description,
          Status: task.status,
          "Estimated Hours": task.estimationHours,
          "Actual Hours": task.actualHours ?? "",
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Worksheet");

    XLSX.writeFile(workbook, `worksheet-${month}-${year}.xlsx`);
  };

  function handleDrop(e: any) {
    var f = e.target.files[0];
    /* f is a File */
    var reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryStr = e.target.result;

      const workbook = XLSX.read(binaryStr, { type: "binary" });

      const sheetName = workbook.SheetNames[0];

      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setImportData(jsonData);
      setModelOpen(true);
    };
    reader.readAsBinaryString(f);
  }

  const handleSaveImport = async () => {
    try {
      await uploadWorksheet(importData);
      setModelOpen(false);
      toast.success("Data imported.");
      setImportData([]);
      fetchWorksheetData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add task");
    }
  };

  return (
    <ProtectedRoute allowRoles={["employee"]}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-Sxl font-bold">WorkSheet</h1>
        </div>
        <div className="flex justify-between p-3">
          <div className="flex gap-4">
            <FormControl size="small" className="w-32">
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                label="Year"
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Month Select */}
            <FormControl size="small" className="w-40">
              <InputLabel>Month</InputLabel>
              <Select
                value={month}
                label="Month"
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                <MenuItem value={1}>January</MenuItem>
                <MenuItem value={2}>February</MenuItem>
                <MenuItem value={3}>March</MenuItem>
                <MenuItem value={4}>April</MenuItem>
                <MenuItem value={5}>May</MenuItem>
                <MenuItem value={6}>June</MenuItem>
                <MenuItem value={7}>July</MenuItem>
                <MenuItem value={8}>August</MenuItem>
                <MenuItem value={9}>September</MenuItem>
                <MenuItem value={10}>October</MenuItem>
                <MenuItem value={11}>November</MenuItem>
                <MenuItem value={12}>December</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="flex gap-4">
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept=".xlsx, .xls"
              onChange={handleDrop}
            />

            <CommonButton
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Import Excel
            </CommonButton>
            {/* Import Excel file
            </Button> */}
            <CommonButton onClick={exportToExcel} variant="outline">
              Export to Excel
            </CommonButton>
          </div>
        </div>
        {data.length === 0 ? (
          <div className="p-6 text-gray-500 text-sm">
            No worksheet data available for the selected month.
          </div>
        ) : (
          data.map((day) => (
            <div key={day.date} className="mb-8">
              <h2 className="text-lg font-semibold">{day.date}</h2>
              <TaskTable data={day.tasks} />
            </div>
          ))
        )}
      </div>
      <Dialog open={modelOpen} onClose={() => setModelOpen(false)}>
        <DialogTitle>Import Worksheet</DialogTitle>

        <DialogContent>
          <Typography>
            Total rows found in Excel: <b>{importData.length}</b>
          </Typography>

          <Typography className="mt-2 text-sm text-gray-500">
            Do you want to import these tasks?
          </Typography>
        </DialogContent>

        <DialogActions>
          <CommonButton onClick={() => setModelOpen(false)} variant="outline">
            Cancel
          </CommonButton>

          <CommonButton onClick={handleSaveImport}>Save</CommonButton>
        </DialogActions>
      </Dialog>
    </ProtectedRoute>
  );
}
