"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  addTask,
  deleteTask,
  editTask,
  getTasks,
  getEmployeesTask,
  getEmployees,
  getEmployeesProject,
} from "@/app/services/auth.service";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import { TASK_STATUS_VALUES } from "@/app/constants/task";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import NumberField from "@/app/components/NumberField";
import DeletePopup from "@/app/components/DeletePopup";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CommonButton from "@/app/components/Button";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      email: string;
      _id: string;
    };
  };
  projectId: {
    _id: string;
    title: string;
  };
  isActive: boolean;
  actualHours: number;
  estimationHours: number;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
}

export default function TasksPage() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Task>({
    defaultValues: {
      title: "",
      description: "",
      isActive: true,
      estimationHours: undefined,
      actualHours: undefined,
    },
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [openPopup, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const user = useSelector((state: RootState) => state?.auth.user);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClosePopup = () => {
    setOpen(false);
  };

  const fetchTasks = async () => {
    try {
      if (user?.role === "admin") {
        const result = await getTasks();
        setTasks(result);
      }
      if (user?.role === "employee") {
        const result = await getEmployeesTask();
        setTasks(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const result = await getEmployees();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const result = await getEmployeesProject();
      setProjects(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "employee") {
      fetchProjects();
    }
  }, [user]);

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }
    try {
      const result = await deleteTask(deleteId);
      fetchTasks();
      toast.success(result.message || "Task deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete task");
    } finally {
      setDeleteId(null);
      handleClosePopup();
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);

    reset({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      status: task.status,
      estimationHours: task.estimationHours,
      actualHours: task.actualHours,
    });

    setShowModal(true);
  };

  const handleView = (task: Task) => {
    setViewTask(task);
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingTask) {
        await editTask(editingTask._id, data);
        toast.success("Task updated successfully!");
      } else {
        await addTask(data);
        toast.success("Task added successfully!");
      }
      fetchTasks();
      setShowModal(false);
      reset({
        title: "",
        description: "",
        projectId: { _id: "" },
        estimationHours: undefined,
        actualHours: undefined,
        status: "",
      });
      setEditingTask(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add task");
    }
  };

  const handleModalOpen = () => {
    setEditingTask(null);
    setShowModal(true);
    reset({
      title: "",
      description: "",
      assignedTo: {
        userId: {
          firstName: "",
          lastName: "",
          email: "",
        },
      },
      projectId: {
        _id: "",
        title: "",
      },
      isActive: true,
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const columns: GridColDef<Task>[] = [
    ...(user?.role === "admin"
      ? [
          {
            field: "assignedTo",
            headerName: "Assigned To",
            flex: 1,
            valueGetter: (value, row) =>
              `${row.assignedTo.userId.firstName || ""} ${row.assignedTo.userId.lastName || ""} `,
          },
        ]
      : []),

    {
      field: "title",
      headerName: "Task Title",
      flex: 1,
    },
    {
      field: "project",
      headerName: "Project",
      flex: 1,
      valueGetter: (value, row) => `${row.projectId.title} `,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const status = params.row.status;

        const getStatusStyle = () => {
          switch (status) {
            case "completed":
              return "bg-green-100 text-green-700";
            case "pending":
              return "bg-yellow-100 text-yellow-700";
            case "in-progress":
              return "bg-blue-100 text-blue-700";
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
      field: "estimationHours",
      headerName: "EST. Hours",
      flex: 1,
    },
    {
      field: "actualHours",
      headerName: "Hours Logged",
      flex: 1,
      renderCell: (params) => {
        const actual = params.row.actualHours;
        const estimated = params.row.estimationHours;

        return (
          <span
            className={
              actual > estimated
                ? "text-red-500 font-semibold"
                : "text-gray-800"
            }
          >
            {actual ?? 0}
          </span>
        );
      },
    },
    {
      field: "actions",
      headerName: "Action",
      flex: 1.5,
      sortable: false,
      renderCell: (params) => {
        const task = params.row;

        return (
          <div className="flex items-center h-full">
            <CommonButton
              className="mx-2"
              variant="outline"
              onClick={() => handleView(task)}
            >
              {" "}
              View
            </CommonButton>

            {user?.role === "employee" && (
              <>
                <CommonButton
                  variant="outline"
                  onClick={() => handleEdit(task)}
                  className="mx-2"
                >
                  Edit
                </CommonButton>

                <CommonButton
                  className="mx-2"
                  variant="outline"
                  onClick={() => {
                    handleOpen();
                    setDeleteId(task._id);
                  }}
                >
                  Delete
                </CommonButton>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter((t) => t.status === "pending").length;

  const inProgressTasks = tasks.filter(
    (t) => t.status === "in-progress",
  ).length;

  const doneTasks = tasks.filter((t) => t.status === "completed").length;

  const filteredTasks = useMemo(() => {
    let data = tasks;

    // ✅ Status filter
    if (statusFilter !== "all") {
      data = data.filter((t) => t.status === statusFilter);
    }

    // ✅ Search filter
    if (globalFilter) {
      const search = globalFilter.toLowerCase();

      data = data.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search) ||
          t.projectId?.title.toLowerCase().includes(search) ||
          t.assignedTo?.userId?.firstName?.toLowerCase().includes(search) ||
          t.assignedTo?.userId?.lastName?.toLowerCase().includes(search),
      );
    }

    return data;
  }, [tasks, statusFilter, globalFilter]);

  return (
    <ProtectedRoute allowRoles={["admin", "employee"]}>
      <div className="p-4">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-Sxl font-bold">Tasks</h1>
        </div>

        <DeletePopup
          open={openPopup}
          handleClose={handleClosePopup}
          handleDelete={handleDelete}
        />

        {viewTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-xl font-bold">Task Details</h2>
                <button
                  onClick={() => setViewTask(null)}
                  className="text-gray-400 hover:text-red-500 text-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Task Name</p>
                  <p className="font-semibold">{viewTask?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Project</p>
                  <p className="font-semibold">{viewTask?.projectId?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold">{viewTask?.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimation</p>
                  <p className="font-semibold">{viewTask?.estimationHours}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-semibold">{viewTask?.description}</p>
              </div>
            </div>
          </div>
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
                <h2 className="text-xl font-bold text-gray-800">
                  {editingTask ? "Edit Task" : "Add Task"}
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
                <div>
                  <TextField
                    size="small"
                    {...register("title", { required: "Title is required" })}
                    type="text"
                    label="Enter task title*"
                    placeholder="Enter task title"
                    className="w-full"
                    helperText={errors.title ? errors.title.message : ""}
                    error={!!errors.title}
                  />
                </div>

                <div>
                  <TextField
                    size="small"
                    label="Enter description"
                    placeholder="Enter description"
                    className="w-full"
                    {...register("description")}
                    helperText={errors.description?.message}
                    error={!!errors.description}
                  />
                </div>

                <div>
                  <FormControl
                    fullWidth
                    margin="dense"
                    error={!!errors.projectId}
                  >
                    <InputLabel size="small" id="project-label">
                      Project*
                    </InputLabel>
                    <Controller
                      name="projectId._id"
                      control={control}
                      rules={{ required: "Project is required" }}
                      render={({ field }) => (
                        <Select
                          size="small"
                          {...field}
                          labelId="project-label"
                          label="Project"
                        >
                          {projects.map((project) => (
                            <MenuItem key={project._id} value={project._id}>
                              {project.title}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />

                    {errors.projectId && (
                      <FormHelperText>
                        {errors.projectId.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </div>

                <div>
                  <FormControl fullWidth margin="dense" error={!!errors.status}>
                    <InputLabel size="small" id="status-label">
                      Status*
                    </InputLabel>
                    <Controller
                      name="status"
                      control={control}
                      rules={{ required: "Status is required" }}
                      render={({ field }) => (
                        <Select
                          size="small"
                          {...field}
                          labelId="status-label"
                          label="Status"
                        >
                          {TASK_STATUS_VALUES.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />

                    {errors.status && (
                      <FormHelperText>{errors.status.message}</FormHelperText>
                    )}
                  </FormControl>
                </div>

                <div>
                  <Controller
                    name="estimationHours"
                    control={control}
                    rules={{
                      required: "Estimation Hours is required",
                      min: {
                        value: 0,
                        message: "Value must be greater than 0",
                      },
                      validate: (value) =>
                        value > 0 || "Value must be greater than 0",
                    }}
                    render={({ field, fieldState }) => (
                      <NumberField
                        label="Estimation Hours*"
                        size="small"
                        min={0}
                        step={0.01}
                        onBlur={field.onBlur}
                        value={field.value ?? null}
                        onValueChange={(value) => field.onChange(value)}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <CommonButton
                    type="button"
                    variant="outline"
                    onClick={handleModalClose}
                    className="px-5 py-2 rounded-xl border hover:bg-gray-100"
                  >
                    Cancel
                  </CommonButton>

                  <CommonButton type="submit" disabled={isSubmitting}>
                    {editingTask ? "Update" : "Save"}
                  </CommonButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {/* 🔍 Search */}
                <TextField
                  size="small"
                  type="text"
                  placeholder="Search..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-64"
                />

                {/* ✅ Status Filter */}
                <FormControl size="small" className="w-40">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {user?.role === "employee" && (
                <CommonButton startIcon={<AddIcon />} onClick={handleModalOpen}>
                  Add Task
                </CommonButton>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white shadow rounded-xl p-4 border">
                <p className="text-xs text-gray-500">Total Tasks</p>
                <h2 className="text-2xl font-bold">{totalTasks}</h2>
              </div>

              <div className="bg-blue-50 shadow rounded-xl p-4 border">
                <p className="text-xs text-gray-500">Todo Tasks</p>
                <h2 className="text-2xl font-bold text-blue-600">
                  {todoTasks}
                </h2>
              </div>

              <div className="bg-yellow-50 shadow rounded-xl p-4 border">
                <p className="text-xs text-gray-500">In Progress</p>
                <h2 className="text-2xl font-bold text-yellow-600">
                  {inProgressTasks}
                </h2>
              </div>

              <div className="bg-green-50 shadow rounded-xl p-4 border">
                <p className="text-xs text-gray-500">Completed Tasks</p>
                <h2 className="text-2xl font-bold text-green-600">
                  {doneTasks}
                </h2>
              </div>
            </div>
            <div style={{ height: 450, width: "100%", marginTop: "10px" }}>
              <DataGrid
                rows={filteredTasks}
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
      </div>
    </ProtectedRoute>
  );
}
