"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setAuth } from "../store/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Restore auth from localStorage on first load
    if (!token) {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        dispatch(
          setAuth({
            token: storedToken,
            user: JSON.parse(storedUser),
          }),
        );
        return;
      } else {
        router.replace("/");
        return;
      }
    }

    // Role check
    if (allowRoles && user && !allowRoles.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [token, user?.name, allowRoles, dispatch, router]);

  if (!token) return null; // optional loader

  return <>{children}</>;
}
