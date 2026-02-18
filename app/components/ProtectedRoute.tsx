"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowRoles?: string[]; // Optional prop to specify allowed roles
}

export default function ProtectedRoute({
  children,
  allowRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  useEffect(() => {
    if (!isAuthReady) return; // Wait until auth state is ready
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/"); // Redirect to login if no token
      return;
    }
    if (!user || (allowRoles && !allowRoles.includes(user.role))) {
      router.replace("/unauthorized"); // Redirect to unauthorized page if role is not allowed
    }
  }, [router, user, allowRoles]);

  if (!isAuthReady) {
    return null; // Optionally, you can show a loading spinner here
  }

  return <>{children}</>;
}
