"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  getAttendance,
  getEmployeesAttendance,
} from "@/app/services/auth.service";
import { RootState } from "@/app/store/store";
import TextField from "@mui/material/TextField";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

interface Attendance {
  inTime: string;
  outTime: string;
  date: string;
  employeeId: {
    userId: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function AttendacePage() {
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchAttnendace = async () => {
    try {
      if (user?.role === "employee") {
        const response = await getEmployeesAttendance();
        setAttendance(response);
      }
      if (user?.role === "admin") {
        const response = await getAttendance();
        setAttendance(response);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttnendace();
  }, [user]);

  const columns = useMemo<GridColDef[]>(() => {
    const baseColumns: GridColDef<Attendance>[] = [
      {
        field: "date",
        headerName: "Date",
        flex: 1,
        renderCell: (params) => {
          const date = params.row.date
            ? new Date(params.row.date).toLocaleDateString()
            : "";
          return <p>{date}</p>;
        },
      },
      {
        field: "day",
        headerName: "Day",
        flex: 1,
        renderCell: (params) => {
          const day = params.row.date
            ? new Date(params.row.date).toLocaleDateString("en-US", {
                weekday: "long",
              })
            : "";
          return <p>{day}</p>;
        },
      },
      {
        field: "inTime",
        headerName: "In Time",
        flex: 1,
        renderCell: (params) => {
          const inTime = params.row.inTime
            ? new Date(params.row.inTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";
          return <p>{inTime}</p>;
        },
      },
      {
        field: "outTime",
        headerName: "Out Time",
        flex: 1,
        renderCell: (params) => {
          const inTime = params.row.outTime
            ? new Date(params.row.outTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";
          return <p>{inTime}</p>;
        },
      },
      {
        field: "totalHours",
        headerName: "Total Hours",
        flex: 1,
        renderCell: (params) => {
          if (!params.row.inTime || !params.row.outTime) return "-";
          const inTime = new Date(params.row.inTime);
          const outTime = new Date(params.row.outTime);
          const diffMs = outTime.getTime() - inTime.getTime();
          const hours = diffMs / (1000 * 60 * 60);
          return <p>{hours.toFixed(2)} hrs</p>;
        },
      },
    ];

    if (user?.role === "admin") {
      baseColumns.unshift({
        field: "name",
        headerName: "Name",
        flex: 1,
        valueGetter: (value, row) =>
          `${row.employeeId.userId.firstName || ""} ${row.employeeId.userId.lastName || ""}`,
      });
    }

    return baseColumns;
  }, [user]);

  const filteredAttendance = attendance.filter((att) => {
    const name = `${att.employeeId?.userId?.firstName || ""} ${
      att.employeeId?.userId?.lastName || ""
    }`.toLowerCase();

    const dateObj = new Date(att.date);
    const attMonth = dateObj.getMonth() + 1;
    const attYear = dateObj.getFullYear();

    const matchesSearch =
      name.includes(globalFilter.toLowerCase()) ||
      dateObj
        .toLocaleDateString()
        .toLowerCase()
        .includes(globalFilter.toLowerCase());

    const matchesMonth = attMonth === month;
    const matchesYear = attYear === year;

    return matchesSearch && matchesMonth && matchesYear;
  });

  return (
    <ProtectedRoute allowRoles={["admin", "employee"]}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-Sxl font-bold">Attendance</h1>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* 🔍 Search Input */}
            <div className="flex gap-4">
              <TextField
                size="small"
                type="text"
                placeholder="Search..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="border p-2 rounded mb-4 w-64"
              />
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
            </div>
            <div style={{ height: 450, width: "100%", marginTop: "10px" }}>
              <DataGrid
                rows={filteredAttendance}
                columns={columns}
                getRowId={(row) =>
                  row.date + (row.employeeId?.userId?.firstName || "")
                }
                pageSizeOptions={[5, 10, 20]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 5 },
                  },
                }}
                disableRowSelectionOnClick
              />
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
