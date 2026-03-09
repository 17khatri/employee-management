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
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import NumberField from "@/app/components/NumberField";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

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
    formState: { errors },
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
  const [logTask, setLogTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const user = useSelector((state: RootState) => state?.auth.user);

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
  }, []);

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

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTask(id);
      fetchTasks();
      toast.success(result.message || "Task deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete task");
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

  const handleLog = async (task: Task) => {
    setLogTask(task);
  };

  const handleLogSubmit = async (data: any) => {
    try {
      const payload = {
        actualHours: data.actualHours,
        status: data.status,
      };
      await editTask(logTask?._id, payload);
      toast.success("Task updated successfully!");
      fetchTasks();
      setLogTask(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add task");
    }
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
    console.log("Modal opened for adding new task");
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

  const columns = useMemo<ColumnDef<Task>[]>(() => {
    const baseColumns: ColumnDef<Task>[] = [
      {
        header: "Task Title",
        accessorFn: (row) => row.title,
      },
      {
        header: "Project",
        accessorFn: (row) => row.projectId?.title,
      },
      {
        header: "Status",
        accessorFn: (row) => row.status,
      },
      {
        header: "EST. Hours",
        accessorFn: (row) => row.estimationHours,
      },
      {
        header: "Hours Logged",
        accessorFn: (row) => row.actualHours,
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex items-center">
            {user?.role === "employee" && (
              <Button
                onClick={() => handleLog(row.original)}
                sx={{ height: "20px" }}
                variant="contained"
                size="small"
              >
                Log
              </Button>
            )}

            <IconButton
              color="primary"
              onClick={() => handleView(row.original)}
            >
              <VisibilityIcon className="text-sm" />
            </IconButton>

            {user?.role === "employee" && (
              <>
                <IconButton onClick={() => handleEdit(row.original)}>
                  <EditIcon className="text-sm" />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() => handleDelete(row.original._id)}
                >
                  <DeleteIcon className="text-sm" />
                </IconButton>
              </>
            )}
          </div>
        ),
      },
    ];

    if (user?.role === "admin") {
      baseColumns.unshift({
        header: "Assigned To",
        accessorFn: (row) =>
          `${row.assignedTo?.userId?.firstName} ${row.assignedTo?.userId?.lastName}`,
      });
    }

    return baseColumns;
  }, [user]);

  const table = useReactTable({
    data: tasks,
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
      <div className="p-4">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-Sxl font-bold">Tasks</h1>
        </div>

        {logTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-xl font-bold">Log Work</h2>
                <button
                  onClick={() => setLogTask(null)}
                  className="text-gray-400 hover:text-red-500 text-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Task</p>
                <p className="font-semibold">{logTask?.title}</p>
              </div>
              <form
                onSubmit={handleSubmit(handleLogSubmit)}
                className="space-y-2 mt-4"
              >
                <div>
                  {/* <TextField
                    size="small"
                    {...register("actualHours", {
                      required: "actualHours is required",
                    })}
                    type="number"
                    label="Log Hours"
                    placeholder="Log Hours"
                    className="w-full"
                    helperText={
                      errors.actualHours ? errors.actualHours.message : ""
                    }
                    error={!!errors.actualHours}
                  /> */}
                  <Controller
                    name="estimationHours"
                    control={control}
                    rules={{ required: "Estimation Hours is required" }}
                    render={({ field, fieldState }) => (
                      <NumberField
                        label="Estimation Hours"
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
                <div>
                  <FormControl fullWidth margin="dense" error={!!errors.status}>
                    <InputLabel size="small" id="status-label">
                      Status
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
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setLogTask(null)}
                    className="px-5 py-2 rounded-xl border hover:bg-gray-100"
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-indigo-600 
                                 text-white font-semibold hover:bg-indigo-700 
                                 shadow-md hover:shadow-lg transition"
                  >
                    {logTask ? "Update" : "Save Log"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                    label="Enter task title"
                    placeholder="Enter task title"
                    className="w-full"
                    helperText={errors.title ? errors.title.message : ""}
                    error={!!errors.title}
                  />
                </div>

                <div>
                  <TextField
                    size="small"
                    {...register("description", {
                      required: "Description is required",
                    })}
                    label="Enter description"
                    placeholder="Enter description"
                    className="w-full"
                    helperText={
                      errors.description ? errors.description.message : ""
                    }
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
                      Project
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
                            <MenuItem
                              key={project._id}
                              value={project._id}
                              disabled={project._id === "manager"}
                            >
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
                      Status
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
                    rules={{ required: "Estimation Hours is required" }}
                    render={({ field, fieldState }) => (
                      <NumberField
                        label="Estimation Hours"
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
                  <Button
                    type="button"
                    onClick={handleModalClose}
                    className="px-5 py-2 rounded-xl border hover:bg-gray-100"
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-indigo-600 
                                 text-white font-semibold hover:bg-indigo-700 
                                 shadow-md hover:shadow-lg transition"
                  >
                    {editingTask ? "Update" : "Save"}
                  </Button>
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
              {/* 🔍 Search Input */}
              <TextField
                size="small"
                type="text"
                placeholder="Search..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="border p-2 rounded mb-4 w-64"
              />
              {user?.role === "employee" && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleModalOpen}
                >
                  Add Task
                </Button>
              )}
            </div>
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
