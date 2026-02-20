"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import { RootState } from "@/app/store/store";
import { useSelector } from "react-redux";

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <ProtectedRoute allowRoles={["admin", "manager", "employee"]}>
      <div className="h-full flex flex-col w-full items-center bg-gray-100 p-6 ">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="mt-4 text-lg">
          Hello <span className="font-semibold capitalize">{user?.role}!</span>{" "}
          Welcome to your dashboard!
        </p>
      </div>
    </ProtectedRoute>
  );
}
