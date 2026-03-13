"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { Controller, useForm } from "react-hook-form";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import {
  addTask,
  addWorkPlan,
  addWorkPlanByIds,
  getEmployeesProject,
  getEmployeesTask,
  getWorkPlans,
} from "@/app/services/auth.service";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";
import NumberField from "@/app/components/NumberField";
import { TASK_STATUS_VALUES } from "@/app/constants/task";
import Button from "@mui/material/Button";
import toast from "react-hot-toast";
import { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";

interface Task {
  title: string;
  description: string;
  status: string;
  projectId: string;
  isActive: boolean;
  estimationHours: number;
  actualHours?: number;
}

interface UsersTask {
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

export default function WorkPlanPage() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<Task>({
    defaultValues: {
      title: "",
      description: "",
      isActive: true,
      estimationHours: undefined,
      status: "",
      projectId: "",
    },
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<UsersTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [workPlans, setWorkPlans] = useState<any[]>([]);
  const [todayEstimation, setTodayEstimation] = useState<
    Record<string, number>
  >({});
  const addToWorkPlan = watch("isActive");
  const user = useSelector((state: RootState) => state?.auth?.user);

  const fetchWorkPlans = async () => {
    try {
      const result = await getWorkPlans();
      console.log(result, "result");
      setWorkPlans(result);
      const taskIds = result.map((wp: any) => wp.taskId._id);
      setSelectedTasks(taskIds);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWorkPlans();
  }, []);

  const fetchProjects = async () => {
    try {
      const result = await getEmployeesProject();
      setProjects(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.role === "employee") {
      fetchProjects();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const result = await getEmployeesTask();
      setTasks(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleNextDate = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handlePrevDate = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await addTask(data);
      toast.success("Task added successfully!");
      const payload = {
        ...data,
        taskId: response._id,
        date: selectedDate,
      };
      if (addToWorkPlan === true) {
        await addWorkPlan(payload);
        toast.success("Workplan added successfully");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save workplan");
    } finally {
      reset({
        title: "",
        description: "",
        projectId: "",
        estimationHours: undefined,
        status: "",
        isActive: true,
      });
    }
  };

  const handleSaveWorkplan = async () => {
    try {
      const payload = {
        ids: selectedTasks.map((taskId) => ({
          id: taskId,
          estimationHours: todayEstimation[taskId] || 0,
        })),
        date: selectedDate,
      };

      await addWorkPlanByIds(payload);

      toast.success("Workplan saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save workplan");
    }
  };

  const columns: GridColDef<UsersTask>[] = [
    {
      field: "select",
      headerName: "Select",
      flex: 1,
      renderCell: (params) => {
        const taskId = params.row._id;

        return (
          <input
            type="checkbox"
            checked={selectedTasks.includes(taskId)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedTasks((prev) => [...prev, taskId]);
              } else {
                setSelectedTasks((prev) => prev.filter((id) => id !== taskId));
              }
            }}
          />
        );
      },
    },
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
    },
    {
      field: "actualHours",
      headerName: "Logged / Estimated",
      flex: 1,
      renderCell: (params) => {
        const actual = params.row.actualHours;
        const estimated = params.row.estimationHours;
        return (
          <p
            className={
              actual > estimated
                ? "text-red-500 font-semibold"
                : "text-gray-800"
            }
          >
            {actual ? actual : 0} /{estimated}
          </p>
        );
      },
    },
    {
      field: "estimationHours",
      headerName: "EST. Hours",
      flex: 1,
    },
    {
      field: "todayEstimation",
      headerName: "Estimation for today (hours)",
      flex: 1,
      renderCell: (params) => {
        const taskId = params.row._id;

        return (
          <TextField
            size="small"
            type="number"
            value={todayEstimation[taskId] || ""}
            onChange={(e) => {
              const value = Number(e.target.value);

              setTodayEstimation((prev) => ({
                ...prev,
                [taskId]: value,
              }));
            }}
          />
        );
      },
    },
  ];

  const undoneTasks = tasks.filter(
    (t) => t.status === "pending" && "in-progress",
  ).length;

  return (
    <ProtectedRoute allowRoles={["employee"]}>
      <div className="p-4">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-xl font-bold">My Work Plan</h1>
        </div>
        <div className="bg-white flex gap-2 px-4 py-8 rounded-2xl shadow-sm">
          <IconButton onClick={handlePrevDate}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <TextField
            size="small"
            type="text"
            label="Select Date"
            placeholder="Select Date"
            className="border p-2 rounded mb-4 w-64"
            value={formatDate(selectedDate)}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
          <IconButton onClick={handleNextDate}>
            <KeyboardArrowRightIcon />
          </IconButton>
        </div>
        <div className="bg-white  gap-2 px-4 py-8 rounded-2xl shadow-sm mt-4">
          <h1 className="text-Sxl font-light">Create New Task</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-4 gap-2 items-center">
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
                    name="projectId"
                    control={control}
                    rules={{ required: "Project is required" }}
                    render={({ field }) => (
                      <Select size="small" {...field} label="Project">
                        {projects.map((project) => (
                          <MenuItem key={project._id} value={project._id}>
                            {project.title}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.projectId && (
                    <FormHelperText>{errors.projectId.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <TextField
                size="small"
                label="Task Title*"
                {...register("title", { required: "Title is required" })}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
              <div>
                <Controller
                  name="estimationHours"
                  control={control}
                  rules={{
                    required: "Estimation Hours is required",
                    min: {
                      value: 1,
                      message: "Estimation hours must be grater then one",
                    },
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
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  Add to selected date work plan
                </label>
              )}
            />
            <Button type="submit" variant="contained" sx={{ width: "300px" }}>
              Create Task
            </Button>
          </form>
        </div>
        <div className="bg-white p-4 mt-4 rounded-2xl">
          <div className="flex justify-between items-center">
            <p className="font-semibold">
              Select Tasks for {formatDate(selectedDate)}
            </p>
            <Button
              onClick={handleSaveWorkplan}
              variant="contained"
              color="success"
            >
              Save workplan
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Select tasks you plan to work on this date and add your estimated
            hours for each task. Tasks marked done today are also shown for
            reference.
          </p>
          <DataGrid
            rows={tasks}
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
      </div>
    </ProtectedRoute>
  );
}
