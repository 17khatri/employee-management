"use client";

import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useAuthStore } from "../store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = useAuthStore((s) => s.user);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && !user) {
      router.push("/");
    }
  }, [isAuthReady, user]);

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
