"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  addHolidays,
  deleteHolidays,
  getHolidays,
  updateHoliday,
} from "@/app/services/auth.service";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "@mui/material/Button";
import { Controller, useForm } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import EditIcon from "@mui/icons-material/Edit";
import dayjs, { Dayjs } from "dayjs";
import DeletePopup from "@/app/components/DeletePopup";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface Holidays {
  _id: string;
  name: string;
  date: Date;
}

type HolidayForm = {
  date: Dayjs | null;
  name: string;
};

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holidays[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holidays | null>(null);
  const [openPopup, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const {
    handleSubmit,
    reset,
    register,
    control,
    formState: { errors },
  } = useForm<HolidayForm>({
    defaultValues: {
      date: null,
      name: "",
    },
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClosePopup = () => {
    setOpen(false);
  };

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

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await deleteHolidays(deleteId);
      toast.success(response.message || "Holiday deleted successfully!");
      fetchHolidays();
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteId(null);
      handleClosePopup();
    }
  };

  const columns: GridColDef<Holidays>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
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
      field: "actions",
      headerName: "Action",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const holiday = params.row;

        return (
          <div className="flex">
            <IconButton onClick={() => handleEdit(holiday)}>
              <EditIcon fontSize="small" />
            </IconButton>

            <IconButton
              color="error"
              onClick={() => {
                handleOpen();
                setDeleteId(holiday._id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        );
      },
    },
  ];

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingHoliday(null);
    reset({
      date: null,
      name: "",
    });
  };

  const handleEdit = (holiday: Holidays) => {
    setEditingHoliday(holiday);

    reset({
      date: holiday.date ? dayjs(holiday.date) : null,
      name: holiday.name,
    });

    setShowModal(true);
  };

  const onSubmit = async (data: any) => {
    try {
      if (!data.date) return;

      if (editingHoliday) {
        await updateHoliday(editingHoliday._id, data);
        toast.success("Holiday updated successfully");
      } else {
        await addHolidays({
          name: data.name,
          date: data.date.toDate(), // 🔥 convert dayjs → JS Date
        });
        toast.success("Holiday added successfully!");
      }
      handleModalClose();
      setEditingHoliday(null);
      reset({
        date: null,
        name: "",
      });
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
            <div style={{ height: 450, width: "100%", marginTop: "10px" }}>
              <DataGrid
                rows={holidays}
                columns={columns}
                getRowId={(row) => row._id}
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

        <DeletePopup
          open={openPopup}
          handleClose={handleClosePopup}
          handleDelete={handleDelete}
        />

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
                  {editingHoliday ? "Update Holiday" : "Add Holiday"}
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
                <div className="mb-3">
                  <TextField
                    size="small"
                    {...register("name", {
                      required: "name is required",
                    })}
                    type="text"
                    className="w-full border p-2 rounded"
                    label="Holiday Name*"
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
                        label="Select date*"
                        format="DD-MM-YYYY"
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
