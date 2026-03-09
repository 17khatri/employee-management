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
}

export default function DashboardPage() {
  const [employeesOnLeave, setEmployeesOnLeave] = useState<TodayLeave[]>([]);
  const [birthdays, setBirthdays] = useState<any>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employeesProjects, setEmployeesProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const user = useSelector((state: RootState) => state?.auth.user);
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      inTime: "",
      outTime: "",
    },
  });

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
  }, []);

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

  const totalHours = (() => {
    if (
      !todayAttendance &&
      (!control._formValues?.inTime || !control._formValues?.outTime)
    )
      return null;

    const inTime = control._formValues?.inTime;
    const outTime = control._formValues?.outTime;

    if (!inTime || !outTime) return null;

    const start = dayjs(inTime);
    const end = dayjs(outTime);

    const diffMinutes = end.diff(start, "minute");

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}m`;
  })();

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
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold">Daily Attendace</p>
                  <p className="text-xs font-light text-gray-500">
                    {now.toLocaleDateString()}
                  </p>
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="inTime"
                    control={control}
                    rules={{ required: "In time is required" }}
                    render={({ field }) => (
                      <TimePicker
                        label="In Time"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(newValue) =>
                          field.onChange(newValue?.toISOString())
                        }
                      />
                    )}
                  />
                  {errors.inTime && (
                    <p className="text-red-500 text-sm">
                      {errors.inTime.message}
                    </p>
                  )}
                  <Controller
                    name="outTime"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        label="Out Time"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(newValue) =>
                          field.onChange(newValue?.toISOString())
                        }
                      />
                    )}
                  />
                  {errors.outTime && (
                    <p className="text-red-500 text-sm">
                      {errors.outTime.message}
                    </p>
                  )}
                </LocalizationProvider>
                <Button variant="contained" className="w-full" type="submit">
                  {todayAttendance ? "Update Time" : "Enter Time"}
                </Button>
                {control._formValues?.inTime &&
                  control._formValues?.outTime && (
                    <p className="text-sm font-semibold text-gray-700">
                      Total Hours: {totalHours}
                    </p>
                  )}
              </form>
            )}
          </div>

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
