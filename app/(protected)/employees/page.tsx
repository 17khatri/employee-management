"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  deleteEmployee,
  getEmployees,
  viewEmployee,
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

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

interface Studies {
  employeeId: string;
  grade: string;
  percentage: string;
  passingYear: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [addStudies, setAddStudies] = useState<Boolean>(false);
  const [editingStudies, setEditingStudies] = useState<Studies | null>(null);

  const fetchEmployees = async () => {
    try {
      const result = await getEmployees();
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

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteEmployee(id);
      fetchEmployees();
      toast.success(result.message || "Employee deleted successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete employee");
    }
  };

  const handleView = async (id: string) => {
    try {
      const result = await viewEmployee(id);
      setSelectedEmployee(result);
      setShowModal(true);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to fetch employee details",
      );
    }
  };

  const handleStudyModalOpen = () => {
    setAddStudies(true);
  };

  const handleStudyModalClose = () => {
    setAddStudies(false);
  };

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        header: "Name",
        accessorFn: (row) => row.userId.name,
      },
      {
        header: "Email",
        accessorFn: (row) => row.userId.email,
      },
      {
        header: "Department",
        accessorFn: (row) => row.departmentId.name,
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
                handleView(row.original._id);
              }}
            >
              <VisibilityIcon className="text-sm" />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => {
                handleDelete(row.original._id);
              }}
            >
              <DeleteIcon className="text-sm" />
            </IconButton>
            <Button
              size="small"
              startIcon={<AddIcon />}
              variant="text"
              color="primary"
              onClick={handleStudyModalOpen}
            >
              Add Studies
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: employees,
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
        <h1 className="text-xl font-bold mb-4">Employees</h1>

        {/* 🔍 Search Input */}
        <TextField
          type="text"
          size="small"
          placeholder="Search..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />

        {addStudies && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 relative
                         animate-[fadeIn_.25s_ease]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-800">Add Studies</h2>
                <button
                  onClick={handleStudyModalClose}
                  className="text-gray-400 cursor-pointer hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form className="space-y-2">
                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outlined"
                    type="button"
                    onClick={handleStudyModalClose}
                  >
                    Cancel
                  </Button>

                  <Button variant="contained">Save</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 relative
                 animate-[fadeIn_.25s_ease]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-800">
                  Employee Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 cursor-pointer hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>
              <p>
                <strong>Name:</strong> {selectedEmployee.userId.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedEmployee.userId.email}
              </p>
              <p>
                <strong>Department:</strong>{" "}
                {selectedEmployee.departmentId.name}
              </p>
              <p>
                <strong>Active:</strong>{" "}
                {selectedEmployee.isActive ? "Yes" : "No"}
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table className="min-w-full bg-white shadow rounded mt-2">
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
