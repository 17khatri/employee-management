"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { getTodayLeaveEmployee } from "@/app/services/auth.service";
import { RootState } from "@/app/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

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

export default function DashboardPage() {
  const [employees, setEmployees] = useState<TodayLeave[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);

  const getEmployees = async () => {
    try {
      const response = await getTodayLeaveEmployee();
      setEmployees(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  return (
    <ProtectedRoute allowRoles={["admin"]}>
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-white to-blue-100 p-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl p-8 shadow-xl">
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="mt-2 text-lg opacity-90">
              Welcome back,{" "}
              <span className="capitalize font-semibold">{user?.role}</span> 👋
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <p className="text-gray-500 text-sm">Employees On Leave</p>
              <h2 className="text-3xl font-bold text-indigo-600 mt-2">
                {employees.length}
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <p className="text-gray-500 text-sm">Today</p>
              <h2 className="text-3xl font-bold text-blue-600 mt-2">
                {new Date().toLocaleDateString()}
              </h2>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <p className="text-gray-500 text-sm">Status</p>
              <h2 className="text-3xl font-bold text-green-600 mt-2">Active</h2>
            </div>
          </div>

          {/* Leave Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">
              Employees On Leave Today
            </h2>

            {employees.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 text-center shadow">
                <p className="text-lg text-gray-600">
                  🎉 No employees are on leave today!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {employees.map((leave) => (
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
        </div>
      </div>
    </ProtectedRoute>
  );
}
