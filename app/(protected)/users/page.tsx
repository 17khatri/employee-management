"use client";

import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Controller, useForm } from "react-hook-form";
import {
  addUser,
  deleteUser,
  editUser,
  getUsers,
  getDepartments,
} from "@/app/services/auth.service";
import { ROLE_VALUES } from "@/app/constants/roles";
import toast from "react-hot-toast";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";

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
    control,
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
  const [globalFilter, setGlobalFilter] = useState("");
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

    setShowModal(true);
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "Name",
        accessorFn: (row) => row.name,
      },
      {
        header: "Email",
        accessorFn: (row) => row.email,
      },
      {
        header: "Active",
        cell: ({ row }) => (row.original.isActive ? "Yes" : "No"),
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex">
            <IconButton
              onClick={() => {
                handleEdit(row.original);
              }}
            >
              <EditIcon className="text-sm" />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => {
                handleDelete(row.original._id);
              }}
            >
              <DeleteIcon className="text-sm" />
            </IconButton>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <ProtectedRoute allowRoles={["admin"]}>
      <div className="p-4">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-Sxl font-bold">Users</h1>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleModalOpen}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
          >
            Add User
          </Button>
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
                  <TextField
                    label="Name"
                    variant="outlined"
                    {...register("name", { required: "Name is required" })}
                    type="text"
                    size="small"
                    placeholder="Enter user name"
                    className="w-full"
                    error={!!errors.name}
                    helperText={errors.name ? errors.name.message : ""}
                  />
                </div>

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
                    type="email"
                    size="small"
                    placeholder="Enter email"
                    className="w-full"
                    error={!!errors.email}
                    helperText={errors.email ? errors.email.message : ""}
                  />
                </div>

                <FormControl fullWidth margin="dense" error={!!errors.role}>
                  <InputLabel size="small" id="role-label">
                    Role
                  </InputLabel>

                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Role is required" }}
                    render={({ field }) => (
                      <Select
                        size="small"
                        {...field}
                        labelId="role-label"
                        label="Role"
                      >
                        {ROLE_VALUES.map((role) => (
                          <MenuItem
                            key={role}
                            value={role}
                            disabled={role === "manager"}
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />

                  {errors.role && (
                    <FormHelperText>{errors.role.message}</FormHelperText>
                  )}
                </FormControl>

                {selectedRole !== "admin" && (
                  <div className="space-y-3">
                    {/* Department Select */}
                    <FormControl
                      fullWidth
                      margin="dense"
                      error={!!errors.departmentId}
                    >
                      <InputLabel size="small" id="department-label">
                        Department
                      </InputLabel>

                      <Controller
                        name="departmentId"
                        control={control}
                        rules={{ required: "Department is required" }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            labelId="department-label"
                            label="Department"
                            size="small"
                          >
                            {departments.map((department) => (
                              <MenuItem
                                key={department._id}
                                value={department._id}
                              >
                                {department.name}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />

                      <FormHelperText>
                        {errors.departmentId?.message}
                      </FormHelperText>
                    </FormControl>

                    {/* Phone Field */}
                    <div>
                      <TextField
                        label="Phone"
                        fullWidth
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^\d{10}$/,
                            message: "Invalid phone number",
                          },
                        })}
                        size="small"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                      />
                    </div>

                    {/* Salary Field */}
                    <TextField
                      label="Salary"
                      fullWidth
                      {...register("salary", {
                        required: "Salary is required",
                        pattern: {
                          value: /^\d+$/,
                          message: "Invalid salary amount",
                        },
                      })}
                      size="small"
                      error={!!errors.salary}
                      helperText={errors.salary?.message}
                    />
                  </div>
                )}

                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-gray-700">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                      Active User
                    </label>
                  )}
                />

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outlined"
                    type="button"
                    onClick={handleModalClose}
                  >
                    Cancel
                  </Button>

                  <Button variant="contained" type="submit">
                    {editingUser ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <TextField
              size="small"
              type="text"
              placeholder="Search..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="border p-2 rounded mb-4 w-64"
            />
            <table className="min-w-full mt-2 bg-white rounded-xl shadow">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 text-xs">Name</th>
                  <th className="p-3 text-xs">Email</th>
                  <th className="p-3 text-xs">Active</th>
                  <th className="p-3 text-xs">Action</th>
                </tr>
              </thead>
              {/* <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t text-xs">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3 capitalize">
                      {user.isActive ? "Yes" : "No"}
                    </td>
                    <td className="flex p-3">
                      <IconButton onClick={() => handleEdit(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          handleDelete(user._id);
                        }}
                        className="flex ml-2 px-3 py-1 gap-1"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody> */}
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 text-xs">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 text-xs py-1 border rounded"
              >
                Previous
              </button>

              <span className="text-xs">
                Page
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </strong>
              </span>

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 text-xs py-1 border rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
