"use client";

import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useForm } from "react-hook-form";
import {
  addUser,
  deleteUser,
  editUser,
  getUsers,
  getDepartments,
} from "@/app/services/auth.service";
import { ROLE_VALUES } from "@/app/constants/roles";
import toast from "react-hot-toast";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";

interface User {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string;
  employee?: {
    phone?: string;
    salary?: number;
    departmentId?: { _id: string; name: string };
  };
}

interface Department {
  _id: string;
  name: string;
}

export default function UserPage() {
  const {
    register,
    handleSubmit,
    reset: resetForm,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      isActive: false,
      role: "",
      departmentId: "",
      salary: "",
      phone: "",
    },
  });
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [active, setActive] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const selectedRole = watch("role");
  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const payload =
        data.role === "admin"
          ? {
              name: data.name,
              email: data.email,
              isActive: data.isActive,
              role: data.role,
            }
          : {
              name: data.name,
              email: data.email,
              isActive: data.isActive,
              role: data.role,
              departmentId: data.departmentId,
              salary: Number(data.salary),
              phone: data.phone,
            };
      if (editingUser) {
        await editUser(editingUser._id, payload);
        toast.success("User updated successfully!");
      } else {
        await addUser(payload); // 🔥 Correct
        toast.success("User added successfully!");
      }

      fetchUsers();
      setShowModal(false);
      resetForm();
      setEditingUser(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);

    resetForm({
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      departmentId: user.employee?.departmentId?._id || "",
      salary: String(user.employee?.salary || ""),
      phone: String(user.employee?.phone || ""),
    });

    setActive(user.isActive);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteUser(id);
      fetchUsers();
      toast.success(result.message || "User deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleModalOpen = () => {
    setEditingUser(null);

    resetForm({
      name: "",
      email: "",
      isActive: false,
      role: "",
      departmentId: "",
      salary: "",
      phone: "",
    });

    setActive(false);
    setShowModal(true);
  };

  return (
    <ProtectedRoute allowRoles={["admin"]}>
      <div className="">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-Sxl font-bold">Users</h1>
          <button
            onClick={handleModalOpen}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
          >
            <MdAdd className="text-sm" />
            Add User
          </button>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 relative
                 animate-[fadeIn_.25s_ease]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingUser ? "Edit User" : "Add User"}
                </h2>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 cursor-pointer hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Name
                  </label>
                  <input
                    {...register("name", { required: "Name is required" })}
                    type="text"
                    placeholder="Enter user name"
                    className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                       focus:ring-indigo-400 outline-none transition"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    placeholder="Enter email"
                    className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                       focus:ring-indigo-400 outline-none transition"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Role
                  </label>
                  <select
                    {...register("role", {
                      required: "Role is required",
                    })}
                    className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                       focus:ring-indigo-400 outline-none transition"
                  >
                    <option value="">Select role</option>
                    {ROLE_VALUES.map((role) => (
                      <option
                        disabled={role === "manager"}
                        key={role}
                        value={role}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {selectedRole !== "admin" && (
                  <div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Department
                      </label>
                      <select
                        {...register("departmentId", {
                          required: "Department is required",
                        })}
                        className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                       focus:ring-indigo-400 outline-none transition"
                      >
                        <option value="">Select department</option>
                        {departments.map((department) => (
                          <option key={department._id} value={department._id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                      {errors.departmentId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.departmentId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone Number
                      </label>
                      <input
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^\d{10}$/,
                            message: "Invalid phone number",
                          },
                        })}
                        type="text"
                        placeholder="Enter phone number"
                        className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                       focus:ring-indigo-400 outline-none transition"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Salary
                      </label>
                      <input
                        {...register("salary", {
                          required: "Salary is required",
                          pattern: {
                            value: /^\d+$/,
                            message: "Invalid salary amount",
                          },
                        })}
                        type="text"
                        placeholder="Enter salary"
                        className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                       focus:ring-indigo-400 outline-none transition"
                      />
                      {errors.salary && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.salary.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    {...register("isActive")}
                    type="checkbox"
                    className="w-4 h-4 accent-indigo-600"
                    onChange={(e) => setActive(e.target.checked)}
                    checked={active}
                  />
                  Active User
                </label>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-5 py-2 rounded-xl border hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-indigo-600 
                       text-white font-semibold hover:bg-indigo-700 
                       shadow-md hover:shadow-lg transition"
                  >
                    {editingUser ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t text-xs">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3 capitalize">
                      {user.isActive ? "Yes" : "No"}
                    </td>
                    <td className="flex p-3">
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                      >
                        <MdEdit className="text-sm" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(user._id);
                        }}
                        className="flex ml-2 px-3 py-1 gap-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        <MdDelete className="text-sm" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
