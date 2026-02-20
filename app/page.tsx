"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { loginUser } from "./services/auth.service";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAuth } from "./store/authSlice";
import { motion } from "framer-motion";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import toast from "react-hot-toast";

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      dispatch(
        setAuth({
          token,
          user: JSON.parse(user),
        }),
      );
      router.replace("/dashboard");
    }
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    try {
      const result = await loginUser(data);

      // Save to localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      // Save to Redux
      dispatch(
        setAuth({
          user: result.user,
          token: result.token,
        }),
      );

      toast.success("Login successful!");
      router.replace("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Welcome Back 👋</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <TextField
              label="Email"
              variant="outlined"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              className="w-full"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <TextField
              label="Password"
              variant="outlined"
              {...register("password", { required: "Password is required" })}
              type="password"
              className="w-full"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
