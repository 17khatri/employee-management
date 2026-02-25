"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState, useMemo } from "react";
import {
  addLeaves,
  getAdminLeaves,
  updateLeaves,
  getEmployeeLeaves,
} from "@/app/services/auth.service";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useSelector } from "react-redux";
import AddIcon from "@mui/icons-material/Add";
import { RootState } from "@/app/store/store";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { Controller, useForm } from "react-hook-form";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import { LEAVE_TYPES_VALUES } from "@/app/constants/leave";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface Leaves {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  date: Date;
  leaveType: string;
  leaveStatus: string;
}

export default function LeavesPage() {
  const [leave, setLeave] = useState<Leaves[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: null,
      leaveType: "",
    },
  });

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset();
  };

  const fetchLeaves = async () => {
    try {
      if (user?.role === "admin") {
        const result = await getAdminLeaves();
        setLeave(result);
      } else {
        const result = await getEmployeeLeaves();
        setLeave(result);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: "Approved" | "Rejected",
  ) => {
    try {
      await updateLeaves(id, { leaveStatus: status });

      fetchLeaves();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      date: data.date?.toISOString(),
    };
    try {
      await addLeaves(payload);
      console.log(payload);
      setShowModal(false);
    } catch (error) {
      console.error(error);
      setShowModal(false);
    }
  };

  const columns = useMemo<ColumnDef<Leaves>[]>(() => {
    const baseColumns: ColumnDef<Leaves>[] = [
      {
        header: "Date",
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
      },
      {
        header: "Leave Type",
        accessorFn: (row) => row.leaveType,
      },
      {
        header: "Leave Status",
        accessorFn: (row) => row.leaveStatus,
      },
    ];

    // If admin → add Name at start
    if (user?.role === "admin") {
      baseColumns.unshift({
        header: "Name",
        accessorFn: (row) => row.userId?.name,
      });

      baseColumns.push({
        header: "Action",
        cell: ({ row }) => {
          const { _id, leaveStatus } = row.original;

          return (
            <div className="flex">
              {leaveStatus === "Pending" && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ margin: "0 8px" }}
                    onClick={() => handleUpdateStatus(_id, "Approved")}
                  >
                    Approve
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    onClick={() => handleUpdateStatus(_id, "Rejected")}
                  >
                    Reject
                  </Button>
                </>
              )}

              {leaveStatus === "Approved" && (
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  sx={{ margin: "0 8px" }}
                  onClick={() => handleUpdateStatus(_id, "Rejected")}
                >
                  Reject
                </Button>
              )}

              {leaveStatus === "Rejected" && (
                <Button
                  variant="contained"
                  size="small"
                  sx={{ margin: "0 8px" }}
                  onClick={() => handleUpdateStatus(_id, "Approved")}
                >
                  Approve
                </Button>
              )}
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [user]);

  const table = useReactTable({
    data: leave,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  return (
    <ProtectedRoute allowRoles={["admin", "employee"]}>
      <div className="p-4">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-xl font-bold mb-4">Leaves</h1>
          {user?.role === "employee" && (
            <Button
              onClick={handleModalOpen}
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
            >
              Apply For Leave
            </Button>
          )}
        </div>

        {/* 🔍 Search Input */}
        <TextField
          type="text"
          size="small"
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <table className="min-w-full bg-white shadow rounded mt-2">
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
              <tr key={row.id} className="border-t">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 text-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 relative
                             animate-[fadeIn_.25s_ease]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-800">
                  Leave Application Form
                </h2>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 cursor-pointer hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: "Date is required" }}
                  render={({ field }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Select date"
                        disablePast
                        value={field.value ?? null}
                        onChange={(newValue) => field.onChange(newValue)}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            error: !!errors.date,
                            helperText: errors.date?.message,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />
                <FormControl
                  fullWidth
                  margin="dense"
                  error={!!errors.leaveType}
                >
                  <InputLabel size="small" id="leave-type-label">
                    Leave Type
                  </InputLabel>

                  <Controller
                    name="leaveType"
                    control={control}
                    rules={{ required: "Leave Type is required" }}
                    render={({ field }) => (
                      <Select
                        size="small"
                        {...field}
                        labelId="leave-type-label"
                        label="Leave Type"
                      >
                        {LEAVE_TYPES_VALUES.map((leave) => (
                          <MenuItem key={leave} value={leave}>
                            {leave.charAt(0).toUpperCase() + leave.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.leaveType && (
                    <FormHelperText>{errors.leaveType.message}</FormHelperText>
                  )}
                </FormControl>
                <Button
                  sx={{ marginTop: "5px" }}
                  type="submit"
                  variant="contained"
                  size="small"
                >
                  Submit
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
