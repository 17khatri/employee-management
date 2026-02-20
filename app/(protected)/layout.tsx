"use client";

import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
