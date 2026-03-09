"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  getAttendance,
  getEmployeesAttendance,
} from "@/app/services/auth.service";
import { RootState } from "@/app/store/store";
import TextField from "@mui/material/TextField";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";

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

  const columns = useMemo<ColumnDef<Attendance>[]>(() => {
    const baseColumns: ColumnDef<Attendance>[] = [
      {
        header: "Date",
        accessorFn: (row) => new Date(row.date).toLocaleDateString(),
      },
      {
        header: "Day",
        accessorFn: (row) =>
          new Date(row.date).toLocaleDateString("en-US", { weekday: "long" }),
      },
      {
        header: "In Time",
        accessorFn: (row) =>
          row.inTime
            ? new Date(row.inTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
      },
      {
        header: "Out Time",
        accessorFn: (row) =>
          row.outTime
            ? new Date(row.outTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
      },
      {
        header: "Total Hours",
        accessorFn: (row) => {
          if (!row.inTime || !row.outTime) return "-";

          const inTime = new Date(row.inTime);
          const outTime = new Date(row.outTime);

          const diffMs = outTime.getTime() - inTime.getTime();
          const hours = diffMs / (1000 * 60 * 60);

          return `${hours.toFixed(2)} hrs`;
        },
      },
    ];

    if (user?.role === "admin") {
      baseColumns.unshift({
        header: "Name",
        accessorFn: (row) =>
          `${row.employeeId?.userId?.firstName || ""} ${row.employeeId?.userId?.lastName || ""}`,
      });
    }

    return baseColumns;
  }, [user]);

  const table = useReactTable({
    data: attendance,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
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
            <TextField
              size="small"
              type="text"
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="border p-2 rounded mb-4 w-64"
            />
            <table className="min-w-full mt-2 bg-white shadow rounded table-fixed">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr className="text-sm" key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="p-3 text-left bg-gray-100 text-xs"
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
                  <tr key={row.id} className="border-t h-12">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 text-xs h-12 align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 📄 Pagination */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 text-xs py-1 border rounded"
              >
                Previous
              </button>

              <span className="text-xs">
                Page
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </strong>
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 text-xs py-1 border rounded"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
