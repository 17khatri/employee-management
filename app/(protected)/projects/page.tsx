"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  addProject,
  deleteProject,
  editProject,
  getEmployees,
  getProjects,
} from "@/app/services/auth.service";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { Controller, useForm } from "react-hook-form";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";
import MenuItem from "@mui/material/MenuItem";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PickerValue } from "@mui/x-date-pickers/internals";

interface Task {
  _id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface Employee {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  isActive: boolean;
  departmentId: {
    name: string;
  };
}

interface Project {
  _id: string;
  title: string;
  description: string;
  assignedTo: string[];
  startDate: PickerValue | undefined;
  endDate: PickerValue | undefined;
  tasks: Task[];
}

export default function ProjectsPage() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Project>({
    defaultValues: {
      title: "",
      description: "",
      startDate: null,
      endDate: null,
      assignedTo: [],
    },
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchProjects = async () => {
    try {
      const result = await getProjects();
      setProjects(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchEmployees = async () => {
    try {
      const result = await getEmployees();
      setEmployees(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteProject(id);
      fetchProjects();
      toast.success(result.message || "Project deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);

    reset({
      title: project.title,
      description: project.description,
    });

    setShowModal(true);
  };

  const handleView = (project: Project) => {
    setViewProject(project);
  };

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        header: "Title",
        accessorFn: (row) => row.title,
      },
      {
        header: "Description",
        accessorFn: (row) => row.description,
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex">
            <IconButton
              color="primary"
              onClick={() => {
                handleView(row.original);
              }}
            >
              <VisibilityIcon className="text-sm" />
            </IconButton>
            {user?.role === "admin" && (
              <div>
                <IconButton
                  onClick={() => {
                    handleEdit(row.original);
                  }}
                >
                  <EditIcon className="text-sm" />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => {
                    handleDelete(row.original._id);
                  }}
                >
                  <DeleteIcon className="text-sm" />
                </IconButton>
              </div>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  const taskColumns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        header: "Title",
        accessorKey: "title",
      },
      {
        header: "Description",
        accessorKey: "description",
      },
      {
        id: "assignedTo",
        header: "Assigned To",
        accessorFn: (row) =>
          row.assignedTo?.userId
            ? `${row.assignedTo.userId.firstName} ${row.assignedTo.userId.lastName}`
            : "Unassigned",
      },
    ],
    [],
  );

  const table = useReactTable({
    data: projects,
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

  const taskTable = useReactTable({
    data: viewProject?.tasks || [],
    columns: taskColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 3,
      },
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingProject) {
        await editProject(editingProject._id, data);
        toast.success("Project updated successfully!");
      } else {
        await addProject(data);
        toast.success("Project added successfully!");
      }
      fetchProjects();
      setShowModal(false);
      reset({
        title: "",
        description: "",
      });
      setEditingProject(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add project");
    }
  };

  const handleModalOpen = () => {
    setEditingProject(null);
    setShowModal(true);
    console.log("Modal opened for adding new project");
    reset({
      title: "",
      description: "",
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  return (
    <ProtectedRoute allowRoles={["admin", "employee"]}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-Sxl font-bold">All Projects</h1>
        </div>

        {viewProject && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Project Details</h2>
                <button
                  onClick={() => setViewProject(null)}
                  className="text-gray-400 hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Project Info */}
              <div className="space-y-2">
                <p>
                  <strong>Title:</strong> {viewProject.title}
                </p>
                <p>
                  <strong>Description:</strong> {viewProject.description}
                </p>
              </div>

              {/* Tasks Section */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">
                  Tasks ({viewProject.tasks?.length || 0})
                </h3>

                {viewProject.tasks && viewProject.tasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full flex-1 bg-white border rounded">
                      <thead>
                        {taskTable.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="p-2 text-left text-xs bg-gray-100"
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
                        {taskTable.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="border-t">
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="p-2 text-xs">
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

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => taskTable.previousPage()}
                        disabled={!taskTable.getCanPreviousPage()}
                        className="px-3 py-1 text-xs border rounded"
                      >
                        Previous
                      </button>

                      <span className="text-xs">
                        Page{" "}
                        <strong>
                          {taskTable.getState().pagination.pageIndex + 1} of{" "}
                          {taskTable.getPageCount()}
                        </strong>
                      </span>

                      <button
                        onClick={() => taskTable.nextPage()}
                        disabled={!taskTable.getCanNextPage()}
                        className="px-3 py-1 text-xs border rounded"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No tasks available.</p>
                )}
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
                  {editingProject ? "Edit Project" : "Add Project"}
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
                    {...register("title", { required: "Title is required" })}
                    type="text"
                    label="Enter task title"
                    placeholder="Enter task title"
                    className="w-full"
                    error={!!errors.title}
                    helperText={errors.title ? errors.title.message : ""}
                  />
                </div>

                <div className="">
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

                <FormControl
                  fullWidth
                  margin="dense"
                  error={!!errors.assignedTo}
                  sx={{
                    marginTop: "0",
                  }}
                >
                  <InputLabel size="small" id="attendees-label">
                    assignedTo
                  </InputLabel>

                  <Controller
                    name="assignedTo"
                    control={control}
                    defaultValue={[]}
                    rules={{ required: "Select at least one attendee" }}
                    render={({ field }) => (
                      <Select
                        multiple
                        labelId="assignedTo-label"
                        label="attendees"
                        {...field}
                        size="small"
                      >
                        {employees
                          .filter((u) => u._id !== user?.id)
                          .map((u) => (
                            <MenuItem key={u._id} value={u._id}>
                              {u.userId?.firstName} {u.userId?.lastName}
                            </MenuItem>
                          ))}
                      </Select>
                    )}
                  />

                  <FormHelperText>{errors.assignedTo?.message}</FormHelperText>
                </FormControl>

                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: "Date is required" }}
                  render={({ field }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Select start date"
                        disablePast
                        value={field.value ?? null}
                        onChange={(newValue) => field.onChange(newValue)}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            error: !!errors.startDate,
                            helperText: errors.startDate?.message,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                />

                <div className="mt-2">
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{ required: "Date is required" }}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Select end date"
                          disablePast
                          value={field.value ?? null}
                          onChange={(newValue) => field.onChange(newValue)}
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.startDate,
                              helperText: errors.startDate?.message,
                            },
                          }}
                        />
                      </LocalizationProvider>
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
                    {editingProject ? "Update" : "Save"}
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
              {user?.role === "admin" && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleModalOpen}
                >
                  Add Project
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
