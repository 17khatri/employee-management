"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  addHolidays,
  deleteHolidays,
  getHolidays,
} from "@/app/services/auth.service";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "@mui/material/Button";
import { Controller, useForm } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface Holidays {
  _id: string;
  name: string;
  date: Date;
}

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holidays[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const {
    handleSubmit,
    reset,
    register,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: null,
      name: "",
    },
  });

  const fetchHolidays = async () => {
    try {
      const response = await getHolidays();
      setHolidays(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleDelete = async (id: any) => {
    try {
      const response = await deleteHolidays(id);
      toast.success(response.message || "Holiday deleted successfully!");
      fetchHolidays();
    } catch (error) {
      console.log(error);
    }
  };

  const columns = useMemo<ColumnDef<Holidays>[]>(
    () => [
      {
        header: "Name",
        accessorFn: (row) => row.name,
      },
      {
        header: "Date",
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex">
            <IconButton
              onClick={() => handleDelete(row.original._id)}
              color="error"
            >
              <DeleteIcon className="text-sm" />
            </IconButton>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: holidays,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (!data.date) return;

      await addHolidays({
        name: data.name,
        date: data.date.toDate(), // 🔥 convert dayjs → JS Date
      });

      toast.success("Holiday added successfully!");
      handleModalClose();
      fetchHolidays(); // refresh table
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add holiday");
    }
  };

  return (
    <ProtectedRoute allowRoles={["admin"]}>
      <div className="p-4">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-xl font-bold mb-4">Holidays</h1>

          <Button
            onClick={handleModalOpen}
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
          >
            Add Holidays
          </Button>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
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
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 relative
                                     animate-[fadeIn_.25s_ease]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-800">Add Holiday</h2>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 cursor-pointer hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <div className="mb-3">
                  <TextField
                    size="small"
                    {...register("name", {
                      required: "name is required",
                    })}
                    type="text"
                    className="w-full border p-2 rounded"
                    label="Holiday Name"
                    error={!!errors.name}
                    helperText={errors.name ? errors.name.message : ""}
                  />
                </div>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: "Date is required" }}
                  render={({ field }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Select date"
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
