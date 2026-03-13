"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  addProject,
  deleteProject,
  editProject,
  getEmployees,
  getEmployeesProject,
  getProjects,
} from "@/app/services/auth.service";
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { PickerValue } from "@mui/x-date-pickers/internals";
import Autocomplete from "@mui/material/Autocomplete";
import dayjs from "dayjs";
import DeletePopup from "@/app/components/DeletePopup";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
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
  const [openPopup, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClosePopup = () => {
    setOpen(false);
  };

  const fetchProjects = async () => {
    try {
      if (user?.role === "employee") {
        const result = await getEmployeesProject();
        setProjects(result);
      }
      if (user?.role === "admin") {
        const result = await getProjects();
        setProjects(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

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

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }
    try {
      const result = await deleteProject(deleteId);
      fetchProjects();
      toast.success(result.message || "Project deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete project");
    } finally {
      setDeleteId(null);
      handleClosePopup();
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);

    reset({
      title: project.title,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      assignedTo: project.assignedTo,
    });

    setShowModal(true);
  };

  const handleView = (project: Project) => {
    setViewProject(project);
  };

  const columns: GridColDef<Project>[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      flex: 1,
      renderCell: (params) => (
        <div className="flex">
          <IconButton color="primary" onClick={() => handleView(params.row)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>

          {user?.role === "admin" && (
            <>
              <IconButton onClick={() => handleEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>

              <IconButton
                color="error"
                onClick={() => {
                  setDeleteId(params.row._id);
                  handleOpen();
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </div>
      ),
    },
  ];

  const taskColumns: GridColDef<Task>[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      flex: 1,
      valueGetter: (value, row) =>
        `${row.assignedTo.userId.firstName || ""} ${row.assignedTo.userId.firstName || ""}`,
    },
  ];

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

  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      `${p.title} ${p.description}`
        .toLowerCase()
        .includes(globalFilter.toLowerCase()),
    );
  }, [projects, globalFilter]);

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
                  className="text-gray-400 hover:text-red-500 text-xl cursor-pointer"
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
                    <Paper sx={{ height: 250, width: "100%", mt: 1 }}>
                      <DataGrid
                        rows={viewProject.tasks}
                        columns={taskColumns}
                        getRowId={(row) => row._id}
                        pageSizeOptions={[3, 5]}
                        initialState={{
                          pagination: {
                            paginationModel: { page: 0, pageSize: 3 },
                          },
                        }}
                        disableRowSelectionOnClick
                        density="compact"
                      />
                    </Paper>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No tasks available.</p>
                )}
              </div>
            </div>
          </div>
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
                    label="Enter task title*"
                    placeholder="Enter task title"
                    className="w-full"
                    error={!!errors.title}
                    helperText={errors.title ? errors.title.message : ""}
                  />
                </div>

                <div className="">
                  <TextField
                    size="small"
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
                  <Controller
                    name="assignedTo"
                    control={control}
                    rules={{ required: "Select at least one attendee" }}
                    render={({ field, fieldState }) => (
                      <Autocomplete
                        multiple
                        size="small"
                        options={employees.filter((u) => u._id !== user?.id)}
                        getOptionLabel={(option) =>
                          `${option.userId?.firstName} ${option.userId?.lastName}`
                        }
                        value={
                          employees.filter((emp) =>
                            field.value?.includes(emp._id),
                          ) || []
                        }
                        onChange={(_, newValue) =>
                          field.onChange(newValue.map((emp) => emp._id))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Assigned To*"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    )}
                  />
                </FormControl>

                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Select start date*"
                        format="DD-MM-YYYY"
                        value={field.value ? dayjs(field.value) : null}
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
                    rules={{ required: "End date is required" }}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Select end date*"
                          format="DD-MM-YYYY"
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(newValue) => field.onChange(newValue)}
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.endDate,
                              helperText: errors.endDate?.message,
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
            <Paper sx={{ height: 450, width: "100%", mt: 2 }}>
              <DataGrid
                rows={filteredProjects}
                columns={columns}
                getRowId={(row) => row._id}
                pageSizeOptions={[5, 10, 20]}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
              />
            </Paper>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
