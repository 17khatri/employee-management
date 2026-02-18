"use client";

import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../store/auth.store";

export default function AuthProvider({ children }: any) {
  const setUser = useAuthStore((s) => s.setUser);
  const setAuthReady = useAuthStore((s) => s.setAuthReady);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser(decoded);
      } catch {
        localStorage.removeItem("token");
      }
    }

    setAuthReady(true);
  }, []);

  return children;
}
