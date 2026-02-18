"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  addTask,
  deleteTask,
  editTask,
  getTasks,
  getEmployees,
  getProjects,
} from "@/app/services/auth.service";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import {
  DndContext,
  closestCenter,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TASK_STATUS_VALUES } from "@/app/constants/task";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { IoEye } from "react-icons/io5";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: {
    _id: string;
    userId: {
      name: string;
      email: string;
      _id: string;
    };
  };
  projectId: {
    _id: string;
    title: string;
  };
  isActive: boolean;
}

interface Employee {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  isActive: boolean;
  departmentId: {
    name: string;
  };
}

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
}

export default function TasksPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Task>({
    defaultValues: {
      title: "",
      description: "",
      assignedTo: {
        _id: "",
      },
      isActive: true,
    },
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const result = await getTasks();
      setTasks(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchEmployees = async () => {
    try {
      const result = await getEmployees();
      console.log("Fetched employees:", result);
      setEmployees(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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
      const result = await deleteTask(id);
      fetchTasks();
      toast.success(result.message || "Task deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);

    reset({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      assignedTo: {
        _id: task.assignedTo._id,
      },
      status: task.status,
    });

    setShowModal(true);
  };

  const handleView = (task: Task) => {
    setViewTask(task);
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingTask) {
        await editTask(editingTask._id, data);
        toast.success("Task updated successfully!");
      } else {
        await addTask(data);
        toast.success("User added successfully!");
      }
      fetchTasks();
      setShowModal(false);
      reset({
        title: "",
        description: "",
        assignedTo: {
          userId: {
            name: "",
            email: "",
          },
        },
        projectId: {
          _id: "",
          title: "",
        },
        isActive: true,
      });
      setEditingTask(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add user");
    }
  };

  const handleModalOpen = () => {
    setEditingTask(null);
    setShowModal(true);
    console.log("Modal opened for adding new task");
    reset({
      title: "",
      description: "",
      assignedTo: {
        userId: {
          name: "",
          email: "",
        },
      },
      projectId: {
        _id: "",
        title: "",
      },
      isActive: true,
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const groupedTasks = useMemo(() => {
    return TASK_STATUS_VALUES.reduce((acc: any, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    }, {});
  }, [tasks]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find((t) => t._id === taskId);

    if (!task || task.status === newStatus) return;

    // 🔥 Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      await editTask(taskId, { status: newStatus });
      toast.success("Task status updated!");
    } catch (error) {
      toast.error("Failed to update status");
      fetchTasks(); // rollback
    }
  };

  function DroppableColumn({
    id,
    children,
    className,
  }: {
    id: string;
    children: React.ReactNode;
    className?: string;
  }) {
    const { setNodeRef } = useDroppable({
      id,
    });

    return (
      <div ref={setNodeRef} className={className}>
        {children}
      </div>
    );
  }

  function DraggableTask({
    task,
    children,
  }: {
    task: Task;
    children: React.ReactNode;
  }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: task._id,
    });

    const style = {
      transform: CSS.Translate.toString(transform),
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-xl shadow p-3"
      >
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-xs text-gray-400 mb-2"
        >
          ⠿ Drag
        </div>
        {children}
      </div>
    );
  }

  return (
    <ProtectedRoute allowRoles={["admin"]}>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="p-4">
          <div className="flex items-center p-3 justify-between">
            <h1 className="text-Sxl font-bold">Tasks</h1>
            <button
              onClick={handleModalOpen}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
            >
              <MdAdd className="text-sm" />
              Add Task
            </button>
          </div>

          {viewTask && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-bold">Project Details</h2>
                  <button
                    onClick={() => setViewTask(null)}
                    className="text-gray-400 hover:text-red-500 text-xl"
                  >
                    ✕
                  </button>
                </div>
                <p>
                  <strong>Title:</strong> {viewTask?.projectId.title}
                </p>
                <h2 className="text-xl font-bold mt-3 mb-1">Task Details</h2>
                <p>
                  <strong>Title:</strong> {viewTask?.title}
                </p>
                <p>
                  <strong>Description:</strong> {viewTask?.description}
                </p>
                <p>
                  <strong>Status:</strong> {viewTask?.status}
                </p>
                <h2 className="text-xl font-bold mt-3 mb-1">
                  Assigned Employee
                </h2>
                <p>
                  <strong>Name:</strong> {viewTask?.assignedTo.userId.name}
                </p>
                <p>
                  <strong>Email:</strong> {viewTask?.assignedTo.userId.email}
                </p>
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
                    {editingTask ? "Edit Task" : "Add Task"}
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

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Select Project
                    </label>

                    <select
                      {...register("projectId._id", {
                        required: "Project is required",
                      })}
                      className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                                       focus:ring-indigo-400 outline-none transition"
                    >
                      <option value="">Select project</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.status.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Select Employee
                    </label>

                    <select
                      {...register("assignedTo._id", {
                        required: "Employee is required",
                      })}
                      className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                                       focus:ring-indigo-400 outline-none transition"
                    >
                      <option value="">Select employee</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.userId.name}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.status.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <select
                      {...register("status", {
                        required: "Status is required",
                      })}
                      className="w-full border p-1 rounded-xl mt-1 focus:ring-2 
                                       focus:ring-indigo-400 outline-none transition"
                    >
                      <option value="">Select status</option>
                      {TASK_STATUS_VALUES.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.status.message}
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
                      {editingTask ? "Update" : "Save"}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[77vh] overflow-y-auto pr-1 custom-scrollbar">
                {TASK_STATUS_VALUES.map((status) => (
                  <DroppableColumn
                    key={status}
                    id={status}
                    className={`${status === "completed" ? "bg-green-100" : ""} 
                ${status === "in-progress" ? "bg-yellow-100" : ""} 
                ${status === "not_started" ? "bg-red-100" : ""} 
                ${status === "pending" ? "bg-red-100" : ""} 
                rounded-xl p-4 shadow-inner`}
                  >
                    {/* Section Header */}
                    <h2 className="text-lg font-bold mb-4 capitalize">
                      {status.replace("_", " ")}
                    </h2>

                    {/* Tasks */}
                    <div className="space-y-3">
                      {groupedTasks[status]?.length === 0 && (
                        <p className="text-sm text-gray-400">No tasks</p>
                      )}

                      {groupedTasks[status]?.map((task: Task) => (
                        <DraggableTask key={task._id} task={task}>
                          <div>
                            <h3 className="font-semibold text-sm">
                              {task.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {task.description}
                            </p>

                            <div className="mt-2 text-xs text-gray-600">
                              👤 {task.assignedTo?.userId?.name}
                            </div>

                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleView(task)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                              >
                                <IoEye className="text-sm" />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(task)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-500 text-white rounded"
                              >
                                <MdEdit className="text-sm" />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(task._id)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded"
                              >
                                <MdDelete className="text-sm" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </DraggableTask>
                      ))}
                    </div>
                  </DroppableColumn>
                ))}
              </div>
            </>
          )}
        </div>
      </DndContext>
    </ProtectedRoute>
  );
}
