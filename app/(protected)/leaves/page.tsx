"use client";

import { useEffect, useState, useMemo } from "react";
import {
  addLeaves,
  getAdminLeaves,
  updateLeavesForAdmin,
  getEmployeeLeaves,
  deleteLeaves,
  updateLeaves,
} from "@/app/services/auth.service";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import TextField from "@mui/material/TextField";
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
import toast from "react-hot-toast";
import dayjs, { Dayjs } from "dayjs";
import DeletePopup from "@/app/components/DeletePopup";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import CommonButton from "@/app/components/Button";

interface Leaves {
  _id: string;
  userId?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  date?: Date;
  leaveType?: string;
  leaveStatus?: string;
  reason?: string;
}

type LeaveForm = {
  date: Dayjs | null;
  leaveType: string;
  reason: string;
};

export default function LeavesPage() {
  const [leave, setLeave] = useState<Leaves[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingLeave, setEditingLeave] = useState<Leaves | null>(null);
  const [openPopup, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("en-CA");
  const user = useSelector((state: RootState) => state.auth?.user);
  const {
    handleSubmit,
    reset,
    control,
    register,
    formState: { errors, isSubmitting },
  } = useForm<LeaveForm>({
    defaultValues: {
      date: null,
      leaveType: "",
      reason: "",
    },
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClosePopup = () => {
    setOpen(false);
  };

  const handleModalOpen = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingLeave(null);
    reset({
      date: null,
      leaveType: "",
      reason: "",
    });
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
  }, [user]);

  const handleUpdateStatus = async (
    id: string,
    status: "Approved" | "Rejected",
  ) => {
    try {
      await updateLeavesForAdmin(id, { leaveStatus: status });

      fetchLeaves();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const onSubmit = async (data: LeaveForm) => {
    try {
      if (editingLeave) {
        await updateLeaves(editingLeave._id, data);
        toast.success("Leaves updated successfully");
      } else {
        await addLeaves(data);
        toast.success("Leave added successfully");
      }

      setShowModal(false);
      setEditingLeave(null);
      reset({
        date: null,
        leaveType: "",
        reason: "",
      });
      fetchLeaves();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }
    try {
      const result = await deleteLeaves(deleteId);
      fetchLeaves();
      toast.success(result.message || "Task deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete task");
    } finally {
      setDeleteId(null);
      handleClosePopup();
    }
  };

  const handleEdit = (leave: Leaves) => {
    setEditingLeave(leave);

    reset({
      date: leave.date ? dayjs(leave.date) : null,
      leaveType: leave.leaveType,
      reason: leave.reason,
    });

    setShowModal(true);
  };

  const columns: GridColDef<Leaves>[] = [
    ...(user?.role === "admin"
      ? [
          {
            field: "userId",
            headerName: "Name",
            flex: 1,
            valueGetter: (value, row) =>
              `${row.userId?.firstName || ""} ${row.userId?.lastName || ""}`,
          },
        ]
      : []),

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
      field: "leaveType",
      headerName: "Leave Type",
      flex: 1,
    },

    {
      field: "leaveStatus",
      headerName: "Leave Status",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const status = params.row?.leaveStatus;

        const getStatusStyle = () => {
          switch (status) {
            case "Approved":
              return "bg-green-100 text-green-700";
            case "Pending":
              return "bg-yellow-100 text-yellow-700";
            case "Rejected":
              return "bg-red-100 text-red-700";
            default:
              return "bg-gray-100 text-gray-700";
          }
        };

        return (
          <div className="flex items-center h-full">
            <span
              className={`${getStatusStyle()} px-2 py-1 text-xs rounded-md capitalize`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    {
      field: "reason",
      headerName: "Reason",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      flex: 1,
      renderCell: (params) => {
        const leave = params.row;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const leaveDate = leave.date ? new Date(leave.date) : null;
        if (leaveDate) leaveDate.setHours(0, 0, 0, 0);

        const isPastDate = leaveDate ? leaveDate < today : false;

        const isDisabled =
          leave.leaveStatus === "Rejected" ||
          leave.leaveStatus === "Approved" ||
          isPastDate;

        if (user?.role === "admin") {
          return (
            <>
              {leave.leaveStatus === "Pending" && (
                <div className="flex items-center gap-2 h-full">
                  <CommonButton
                    variant="outline"
                    onClick={() => handleUpdateStatus(leave._id, "Approved")}
                  >
                    Approve
                  </CommonButton>

                  <CommonButton
                    variant="outline"
                    onClick={() => handleUpdateStatus(leave._id, "Rejected")}
                  >
                    Reject
                  </CommonButton>
                </div>
              )}
              {leave.leaveStatus === "Approved" && (
                <div className="flex items-center h-full">
                  <CommonButton
                    variant="outline"
                    onClick={() => handleUpdateStatus(leave._id, "Rejected")}
                  >
                    Reject
                  </CommonButton>
                </div>
              )}
              {leave.leaveStatus === "Rejected" && (
                <div className="flex items-center h-full">
                  <CommonButton
                    variant="outline"
                    onClick={() => {
                      handleUpdateStatus(leave._id, "Approved");
                    }}
                  >
                    Approve
                  </CommonButton>
                </div>
              )}
            </>
          );
        }
        if (user?.role === "employee") {
          return (
            <div className="flex gap-2 items-center h-full">
              <CommonButton
                disabled={isDisabled}
                variant="outline"
                onClick={() => handleEdit(leave)}
              >
                Edit
              </CommonButton>

              <CommonButton
                variant="outline"
                onClick={() => {
                  handleOpen();
                  setDeleteId(leave._id);
                }}
              >
                Delete
              </CommonButton>
            </div>
          );
        }
      },
    },
  ];

  const filteredLeave = useMemo(() => {
    let data = leave;

    if (statusFilter !== "all") {
      data = data.filter((l) => l.leaveStatus === statusFilter);
    }

    if (globalFilter) {
      data = data.filter(
        (l) =>
          l.reason?.toLowerCase().includes(globalFilter.toLowerCase()) ||
          l.leaveType?.toLowerCase().includes(globalFilter.toLowerCase()),
      );
    }

    return data;
  }, [leave, statusFilter, globalFilter]);

  return (
    <ProtectedRoute allowRoles={["admin", "employee"]}>
      <div className="p-4">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-xl font-bold mb-4">Leaves</h1>
          {user?.role === "employee" && (
            <CommonButton onClick={handleModalOpen} startIcon={<AddIcon />}>
              Apply For Leave
            </CommonButton>
          )}
        </div>

        {/* 🔍 Search Input */}
        <div className="flex gap-2">
          <TextField
            type="text"
            size="small"
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <FormControl size="small" className="w-40">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Paper sx={{ height: 450, width: "100%", mt: 2 }}>
          <DataGrid
            rows={filteredLeave}
            columns={columns}
            getRowId={(row) => row._id}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 5 } },
            }}
            disableRowSelectionOnClick
          />
        </Paper>

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
                <div className="my-1">
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: "Date is required" }}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Select date*"
                          disablePast
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
                </div>
                <div className="my-1">
                  <FormControl
                    fullWidth
                    margin="dense"
                    error={!!errors.leaveType}
                  >
                    <InputLabel size="small" id="leave-type-label">
                      Leave Type*
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
                      <FormHelperText>
                        {errors.leaveType.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>
                <div className="my-1">
                  <TextField
                    label="Reason*"
                    variant="outlined"
                    {...register("reason", {
                      required: "reason is required",
                    })}
                    className="w-full"
                    size="small"
                    placeholder="Reason"
                    error={!!errors.reason}
                    helperText={errors.reason ? errors.reason.message : ""}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <CommonButton
                    type="button"
                    variant="outline"
                    onClick={handleModalClose}
                    className="px-5 py-2 rounded-xl border hover:bg-gray-100"
                  >
                    Cancel
                  </CommonButton>

                  <CommonButton disabled={isSubmitting} type="submit">
                    {editingLeave ? "Update Leave" : "Submit"}
                  </CommonButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
