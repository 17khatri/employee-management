"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  getTodayLeaveEmployee,
  bdayEmployee,
  postAttendance,
  getTodaysAttendance,
  updateAttendance,
  getProjects,
  getEmployees,
  getEmployeesProject,
  getEmployeesTask,
  getWorkPlans,
  editTask,
} from "@/app/services/auth.service";
import { RootState } from "@/app/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Controller } from "react-hook-form";
import dayjs from "dayjs";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import NumberField from "@/app/components/NumberField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { TASK_STATUS_VALUES } from "@/app/constants/task";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";

interface TodayLeave {
  _id: string;
  date: string;
  leaveType: string;
  leaveStatus: string;
  userId: {
    _id: string;
    name: string;
    email: string;
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
}

interface FormValues {
  inTime: string;
  outTime: string;
}

interface Task {
  _id: string;
  taskId?: string;
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

interface Workplan {
  _id: string;
  taskId: {
    _id: string;
    title: string;
    description: string;
    status: string;
    projectId: {
      title: string;
    };
    estimationHours: number;
    actualHours: number;
  };
  date: Date;
}

interface LogFormValues {
  actualHours: number;
  status: string;
}

export default function DashboardPage() {
  const [employeesOnLeave, setEmployeesOnLeave] = useState<TodayLeave[]>([]);
  const [birthdays, setBirthdays] = useState<any>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employeesProjects, setEmployeesProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [workplan, setWorkPlan] = useState<Workplan[]>([]);
  const [logTask, setLogTask] = useState<Workplan | null>(null);
  const user = useSelector((state: RootState) => state?.auth.user);
  const {
    handleSubmit: handleAttendanceSubmit,
    control: attendanceControl,
    getValues,
    setValue,
    formState: { errors: attendanceErrors },
  } = useForm<FormValues>({
    defaultValues: {
      inTime: "",
      outTime: "",
    },
  });

  const {
    handleSubmit: handleLogSubmitForm,
    control: logControl,
    reset: resetLogForm,
    formState: { errors: logErrors },
  } = useForm<LogFormValues>({
    defaultValues: {
      actualHours: 0,
      status: "",
    },
  });

  const fetchWorkPlans = async () => {
    try {
      const response = await getWorkPlans();
      setWorkPlan(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWorkPlans();
  }, []);

  const fetchEmployeesonLeave = async () => {
    try {
      const response = await getTodayLeaveEmployee();
      setEmployeesOnLeave(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEmployeesonLeave();
  }, []);

  const getBirthdayEmployees = async () => {
    try {
      const response = await bdayEmployee();
      setBirthdays(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getBirthdayEmployees();
  }, []);

  const now = new Date();

  const loadTodayAttendance = async () => {
    try {
      const response = await getTodaysAttendance();

      if (response.length > 0) {
        const attendance = response[0];
        setTodayAttendance(attendance);
        console.log(todayAttendance, "todayAttendance");
        setValue("inTime", attendance.inTime || "");
        setValue("outTime", attendance.outTime || "");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.role === "employee") {
      loadTodayAttendance();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const result = await getEmployees();
      setEmployees(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const result = await getProjects();
      setProjects(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchEmployeesProjects = async () => {
    try {
      const result = await getEmployeesProject();
      setEmployeesProjects(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.role === "employee") {
      fetchEmployeesProjects();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const result = await getEmployeesTask();
      setTasks(result);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.role === "employee") {
      fetchTasks();
    }
  }, []);

  const activeTasks = tasks.filter(
    (task) => task.status !== "completed",
  ).length;

  const totalTasks = workplan.length;

  const inProgressTasks = workplan.filter(
    (task) => task.taskId.status === "in-progress",
  ).length;

  const pendingTasks = workplan.filter(
    (task) => task.taskId.status === "pending",
  ).length;

  const doneTasks = workplan.filter(
    (task) => task.taskId.status === "completed",
  ).length;

  const onSubmit = async (data: FormValues) => {
    try {
      if (!todayAttendance) {
        await postAttendance(data);
        toast.success("Attendance added");
      } else {
        await updateAttendance(todayAttendance._id, data);
        toast.success("Attendance updated");
      }
      await loadTodayAttendance();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add task");
    }
  };

  const handleLogSubmit = async (data: LogFormValues) => {
    try {
      const payload = {
        actualHours: data.actualHours,
        status: data.status,
        workplan: true,
      };
      await editTask(logTask?.taskId._id, payload);
      toast.success("Task updated successfully");
      setLogTask(null);
      fetchWorkPlans();
    } catch (error) {
      toast.error("Failed to update log");
    }
  };

  const totalHours = (() => {
    if (
      !todayAttendance &&
      (!attendanceControl._formValues?.inTime ||
        !attendanceControl._formValues?.outTime)
    )
      return null;

    const inTime = attendanceControl._formValues?.inTime;
    const outTime = attendanceControl._formValues?.outTime;

    if (!inTime || !outTime) return null;

    const start = dayjs(inTime);
    const end = dayjs(outTime);

    const diffMinutes = end.diff(start, "minute");

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}m`;
  })();

  const handleLog = (workplan: Workplan) => {
    setLogTask(workplan);

    resetLogForm({
      actualHours: workplan.taskId.actualHours || 0,
      status: workplan.taskId.status,
    });
  };

  const columns: GridColDef<Workplan>[] = [
    {
      field: "title",
      headerName: "Task Title",
      flex: 1.5,
      renderCell: (params) => {
        return <p>{params.row.taskId.title}</p>;
      },
    },
    {
      field: "project",
      headerName: "Project",
      flex: 1,
      valueGetter: (value, row) => `${row.taskId?.projectId?.title} `,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        return <p>{params.row.taskId.status}</p>;
      },
    },
    {
      field: "estimationHours",
      headerName: "EST. Hours",
      flex: 1,
      renderCell: (params) => {
        return <p>{params.row.taskId.estimationHours}</p>;
      },
    },
    {
      field: "actualHours",
      headerName: "Hours Logged",
      flex: 1,
      renderCell: (params) => {
        const actual = params.row.taskId.actualHours;
        const estimated = params.row.taskId.estimationHours;

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
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const task = params.row;

        return (
          <div className="flex items-center">
            <Button
              onClick={() => handleLog(task)}
              size="small"
              variant="contained"
            >
              Log
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedRoute allowRoles={["admin", "employee"]}>
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-white to-blue-100 p-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start">
            <div
              className={`${user?.role === "employee" ? "w-[60%]" : "w-full"} bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl p-8 shadow-xl`}
            >
              <h1 className="text-4xl font-bold">Dashboard</h1>
              <p className="mt-2 text-lg opacity-90">
                Welcome back,{" "}
                <span className="capitalize font-semibold">{user?.role}</span>{" "}
                👋
              </p>
            </div>
            {user?.role === "employee" && (
              <form
                className="w-[30%] flex flex-col gap-4 bg-white rounded-2xl p-8 shadow-xl"
                onSubmit={handleAttendanceSubmit(onSubmit)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold">Daily Attendace</p>
                  <p className="text-xs font-light text-gray-500">
                    {now.toLocaleDateString()}
                  </p>
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {/* In Time */}
                  <Controller
                    name="inTime"
                    control={attendanceControl}
                    rules={{ required: "In time is required" }}
                    render={({ field }) => (
                      <TimePicker
                        label="In Time"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(newValue) =>
                          field.onChange(newValue?.toISOString())
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            error: !!attendanceErrors.inTime,
                            helperText: attendanceErrors.inTime?.message,
                          },
                        }}
                      />
                    )}
                  />

                  {/* Out Time */}
                  <Controller
                    name="outTime"
                    control={attendanceControl}
                    rules={{
                      validate: (value) => {
                        const inTime = getValues("inTime");

                        if (!inTime || !value) return true;

                        const start = dayjs(inTime);
                        const end = dayjs(value);

                        return (
                          end.isAfter(start) || "Out Time must be after In Time"
                        );
                      },
                    }}
                    render={({ field }) => (
                      <TimePicker
                        label="Out Time"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(newValue) =>
                          field.onChange(newValue?.toISOString())
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                            error: !!attendanceErrors.outTime,
                            helperText: attendanceErrors.outTime?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
                <Button variant="contained" className="w-full" type="submit">
                  {todayAttendance ? "Update Time" : "Enter Time"}
                </Button>
                {attendanceControl._formValues?.inTime &&
                  attendanceControl._formValues?.outTime && (
                    <p className="text-sm font-semibold text-gray-700">
                      Total Hours: {totalHours}
                    </p>
                  )}
              </form>
            )}
          </div>

          {user?.role === "employee" && (
            <div className="bg-white p-6 rounded-2xl shadow mt-4">
              <h1 className="text-xl font-bold mb-4">My Work Plan</h1>

              {/* Task Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalTasks}
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {inProgressTasks}
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {pendingTasks}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-gray-500">Done</p>
                  <p className="text-2xl font-bold text-green-600">
                    {doneTasks}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-end mb-4">
                <p>Estimation Hours:</p>
                <p>Hours Logged Today:</p>
              </div>
              <DataGrid
                rows={workplan}
                columns={columns}
                getRowId={(row) => row._id}
                disableRowSelectionOnClick
              />
            </div>
          )}

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
                  <p className="font-semibold">{logTask?.taskId.title}</p>
                </div>
                <form
                  onSubmit={handleLogSubmitForm(handleLogSubmit)}
                  className="space-y-2 mt-4"
                >
                  <div>
                    <Controller
                      name="actualHours"
                      control={logControl}
                      rules={{
                        required: "Actual Hours is required",
                        min: {
                          value: 1,
                          message: "Logged hours is must be greater then one",
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <NumberField
                          label="Log Hours"
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
                    <FormControl
                      fullWidth
                      margin="dense"
                      error={!!logErrors.status}
                    >
                      <InputLabel size="small" id="status-label">
                        Status
                      </InputLabel>
                      <Controller
                        name="status"
                        control={logControl}
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
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />

                      {logErrors.status && (
                        <FormHelperText>
                          {logErrors.status.message}
                        </FormHelperText>
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {user?.role === "admin" && (
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
                <p className="text-gray-500 text-sm">Total Employees</p>
                <h2 className="text-3xl font-bold text-pink-600 mt-2">
                  {employees.length}
                </h2>
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <p className="text-gray-500 text-sm">Employees On Leave</p>
              <h2 className="text-3xl font-bold text-indigo-600 mt-2">
                {employeesOnLeave.length}
              </h2>
            </div>
            {user?.role === "admin" && (
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
                <p className="text-gray-500 text-sm">Total Projects</p>
                <h2 className="text-3xl font-bold text-pink-600 mt-2">
                  {projects.length}
                </h2>
              </div>
            )}
            {user?.role === "employee" && (
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
                <p className="text-gray-500 text-sm">My Projects</p>
                <h2 className="text-3xl font-bold text-pink-600 mt-2">
                  {employeesProjects.length}
                </h2>
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <p className="text-gray-500 text-sm">Birthdays This Month</p>
              <h2 className="text-3xl font-bold text-indigo-600 mt-2">
                {birthdays.length}
              </h2>
            </div>
            {user?.role === "employee" && (
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
                <p className="text-gray-500 text-sm">My Active Tasks</p>
                <h2 className="text-3xl font-bold text-indigo-600 mt-2">
                  {activeTasks}
                </h2>
              </div>
            )}
          </div>

          {/* Leave Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">
              Employees On Leave Today
            </h2>

            {employeesOnLeave.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 text-center shadow">
                <p className="text-lg text-gray-600">
                  🎉 No employees are on leave today!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {employeesOnLeave.map((leave) => (
                  <div
                    key={leave._id}
                    className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                        {leave.userId.name.charAt(0)}
                      </div>

                      <div>
                        <p className="text-lg font-semibold">
                          {leave.userId.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {leave.userId.email}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold
                    ${
                      leave.leaveType === "Full-Day"
                        ? "bg-red-100 text-red-600"
                        : leave.leaveType === "First-Half"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-600"
                    }`}
                    >
                      {leave.leaveType}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Birthday Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">
              🎂 Upcoming Birthdays
            </h2>

            {birthdays.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 text-center shadow">
                <p className="text-lg text-gray-600">
                  No birthdays this month 🎈
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {birthdays.map((emp: any) => (
                  <div
                    key={emp._id}
                    className="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                        {emp.user.firstName?.charAt(0)}
                      </div>

                      <div>
                        <p className="text-lg font-semibold">
                          {emp.user?.firstName} {emp.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(emp.birthDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-2 rounded-full text-sm font-semibold bg-pink-100 text-pink-600">
                      🎉 Birthday
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
