"use client";

import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-start">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
