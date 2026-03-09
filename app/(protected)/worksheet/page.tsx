"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { getWorksheetData } from "@/app/services/auth.service";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

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

  return (
    <ProtectedRoute allowRoles={["employee"]}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-Sxl font-bold">WorkSheet</h1>
        </div>
        <div className="flex gap-4 p-3">
          {/* Year Select */}
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
    </ProtectedRoute>
  );
}
