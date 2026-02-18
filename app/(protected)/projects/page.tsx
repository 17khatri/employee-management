"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  addProject,
  deleteProject,
  editProject,
  getProjects,
} from "@/app/services/auth.service";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { IoEye } from "react-icons/io5";

interface Task {
  _id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
}

interface Project {
  _id: string;
  title: string;
  description: string;
  tasks: Task[];
}

export default function ProjectsPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Project>({
    defaultValues: {
      title: "",
      description: "",
    },
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchProjects = async () => {
    try {
      const result = await getProjects();
      setProjects(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteProject(id);
      fetchProjects();
      toast.success(result.message || "Project deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);

    reset({
      title: project.title,
      description: project.description,
    });

    setShowModal(true);
  };

  const handleView = (project: Project) => {
    setViewProject(project);
  };

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        header: "Title",
        accessorFn: (row) => row.title,
      },
      {
        header: "Description",
        accessorFn: (row) => row.description,
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex">
            <button
              onClick={() => {
                handleView(row.original);
              }}
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <IoEye className="text-sm" />
              View
            </button>
            <button
              onClick={() => {
                handleEdit(row.original);
              }}
              className="flex items-center gap-1 px-3 ml-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              <MdEdit className="text-sm" />
              Edit
            </button>
            <button
              onClick={() => {
                handleDelete(row.original._id);
              }}
              className="flex items-center gap-1 ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              <MdDelete className="text-sm" />
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const taskColumns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        header: "Title",
        accessorKey: "title",
      },
      {
        header: "Description",
        accessorKey: "description",
      },
      {
        header: "Assigned To",
        accessorKey: "assignedTo.userId.name",
      },
    ],
    [],
  );

  const table = useReactTable({
    data: projects,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const taskTable = useReactTable({
    data: viewProject?.tasks || [],
    columns: taskColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 3, // 🔥 Max 3 tasks per page
      },
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingProject) {
        await editProject(editingProject._id, data);
        toast.success("Project updated successfully!");
      } else {
        await addProject(data);
        toast.success("Project added successfully!");
      }
      fetchProjects();
      setShowModal(false);
      reset({
        title: "",
        description: "",
      });
      setEditingProject(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add project");
    }
  };

  const handleModalOpen = () => {
    setEditingProject(null);
    setShowModal(true);
    console.log("Modal opened for adding new project");
    reset({
      title: "",
      description: "",
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  return (
    <ProtectedRoute allowRoles={["admin"]}>
      <div className="p-4">
        <div className="flex items-center p-3 justify-between">
          <h1 className="text-Sxl font-bold">Projects</h1>
          <button
            onClick={handleModalOpen}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
          >
            <MdAdd className="text-sm" />
            Add Project
          </button>
        </div>

        {/* 🔍 Search Input */}
        <input
          type="text"
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="border p-2 rounded mb-4 w-64"
        />

        {viewProject && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Project Details</h2>
                <button
                  onClick={() => setViewProject(null)}
                  className="text-gray-400 hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Project Info */}
              <div className="space-y-2">
                <p>
                  <strong>Title:</strong> {viewProject.title}
                </p>
                <p>
                  <strong>Description:</strong> {viewProject.description}
                </p>
              </div>

              {/* Tasks Section */}
              <div className="mt-4">
                <h3 className="font-semibold mb-2">
                  Tasks ({viewProject.tasks?.length || 0})
                </h3>

                {viewProject.tasks && viewProject.tasks.length > 0 ? (
                  <>
                    <table className="min-w-full bg-white border rounded">
                      <thead>
                        {taskTable.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="p-2 text-left text-xs bg-gray-100"
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>

                      <tbody>
                        {taskTable.getRowModel().rows.map((row) => (
                          <tr key={row.id} className="border-t">
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id} className="p-2 text-xs">
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

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => taskTable.previousPage()}
                        disabled={!taskTable.getCanPreviousPage()}
                        className="px-3 py-1 text-xs border rounded"
                      >
                        Previous
                      </button>

                      <span className="text-xs">
                        Page{" "}
                        <strong>
                          {taskTable.getState().pagination.pageIndex + 1} of{" "}
                          {taskTable.getPageCount()}
                        </strong>
                      </span>

                      <button
                        onClick={() => taskTable.nextPage()}
                        disabled={!taskTable.getCanNextPage()}
                        className="px-3 py-1 text-xs border rounded"
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">No tasks available.</p>
                )}
              </div>
            </div>
          </div>
        )}

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
                  {editingProject ? "Edit Project" : "Add Project"}
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
                    Title
                  </label>
                  <input
                    {...register("title", { required: "Title is required" })}
                    type="text"
                    placeholder="Enter task title"
                    className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                                 focus:ring-indigo-400 outline-none transition"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Descriptions
                  </label>
                  <input
                    {...register("description", {
                      required: "Description is required",
                    })}
                    placeholder="Enter description"
                    className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                                 focus:ring-indigo-400 outline-none transition"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

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
                    {editingProject ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table className="min-w-full bg-white shadow rounded">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr className="text-sm" key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="p-3 text-left bg-gray-100 text-xs"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

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

            {/* 📄 Pagination */}
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
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
