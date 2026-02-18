"use client";

import React from "react";
import { useAuthStore } from "../../store/auth.store";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="h-full flex flex-col w-full items-center bg-gray-100 p-6 ">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="mt-4 text-lg">
        Hello <span className="font-semibold capitalize">{user?.role}!</span>{" "}
        Welcome to your dashboard!
      </p>
    </div>
  );
}
