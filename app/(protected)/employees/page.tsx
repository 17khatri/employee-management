"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  deleteEmployee,
  getEmployees,
  viewEmployee,
  addEmployeeStudies,
  getEmployeesStudies,
  deleteStudies,
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
import RemoveIcon from "@mui/icons-material/Remove";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import NumberField from "@/app/components/NumberField";

interface Employee {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  isActive: boolean;
  departmentId: {
    name: string;
  };
}

interface Studies {
  _id?: string;
  grade: string;
  percentage: string;
  passingYear: string;
}

export interface StudyFormValues {
  education: Studies[];
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
  const [statusFilter, setStatusFilter] = useState("all");
  const { control, register, handleSubmit, reset } = useForm<StudyFormValues>({
    defaultValues: {
      education: [{ grade: "", percentage: "", passingYear: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

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

  const handleStudyModalOpen = async (employee: Employee) => {
    try {
      setSelectedEmployee(employee);
      const response = await getEmployeesStudies(employee._id);
      if (response && response.length > 0) {
        const formattedData = response.map((item: any) => ({
          _id: item._id,
          grade: item.grade || "",
          percentage: item.percentage || "",
          passingYear: item.passingYear || "",
        }));
        reset({ education: formattedData });
      } else {
        reset({
          education: [{ grade: "", percentage: "", passingYear: "" }],
        });
      }
      setAddStudies(true);
    } catch (error) {}
  };

  const handleRemoveStudy = async (index: number) => {
    const study = fields[index];

    try {
      // If study exists in DB
      if (study?._id) {
        await deleteStudies(study._id);
        toast.success("Study deleted successfully");
      }

      // Remove from form (UI)
      remove(index);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete study");
    }
  };

  const handleStudyModalClose = () => {
    setSelectedEmployee(null);
    setAddStudies(false);
    reset({
      education: [{ grade: "", percentage: "", passingYear: "" }],
    });
  };

  const downloadEmployeePDF = async (employee: Employee) => {
    try {
      // Fetch employee studies
      const studies = await getEmployeesStudies(employee._id);

      const doc = new jsPDF();

      const fullName = `${employee.userId.firstName} ${employee.userId.lastName}`;

      // Company Header
      doc.setFontSize(18);
      doc.text("Employee Profile Report", 14, 15);

      doc.setFontSize(10);
      doc.text("Company HR Management System", 14, 22);

      // Line separator
      doc.line(14, 25, 196, 25);

      // Employee Details
      doc.setFontSize(14);
      doc.text("Employee Information", 14, 35);

      const employeeDetails = [
        ["Name", fullName],
        ["Email", employee.userId.email],
        ["Department", employee.departmentId?.name || "-"],
        ["Phone", (employee as any).phone || "-"],
        ["Salary", (employee as any).salary || "-"],
        ["Status", employee.isActive ? "Active" : "Inactive"],
        [
          "Birth Date",
          (employee as any).birthDate
            ? new Date((employee as any).birthDate).toLocaleDateString()
            : "-",
        ],
        ["Gender", (employee as any).gender || "-"],
      ];

      autoTable(doc, {
        startY: 40,
        head: [["Field", "Value"]],
        body: employeeDetails,
        theme: "grid",
      });

      // Education Section
      const studiesStart = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(14);
      doc.text("Education Details", 14, studiesStart);

      const educationData =
        studies?.length > 0
          ? studies.map((study: any) => [
              study.grade || "-",
              study.percentage || "-",
              study.passingYear || "-",
            ])
          : [["No education records found", "", ""]];

      autoTable(doc, {
        startY: studiesStart + 5,
        head: [["Grade", "Percentage", "Passing Year"]],
        body: educationData,
        theme: "grid",
      });

      // Footer
      const pageHeight = doc.internal.pageSize.height;

      doc.setFontSize(10);
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        14,
        pageHeight - 10,
      );

      doc.save(`${fullName}-employee-profile.pdf`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        header: "Name",
        accessorFn: (row) => `${row.userId.firstName} ${row.userId.lastName} `,
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
              onClick={() => handleStudyModalOpen(row.original)}
            >
              Add Studies
            </Button>
            <Button
              size="small"
              color="error"
              variant="contained"
              onClick={() => downloadEmployeePDF(row.original)}
            >
              Download PDF
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const filteredUsers = useMemo(() => {
    if (statusFilter === "all") return employees;

    return employees.filter((employee) =>
      statusFilter === "active" ? employee.isActive : !employee.isActive,
    );
  }, [employees, statusFilter]);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const onSubmit = async (data: StudyFormValues) => {
    try {
      await addEmployeeStudies(data, selectedEmployee?._id);
      toast.success("Studies saved successfully");
      handleStudyModalClose();
    } catch (error) {
      toast.error("Failed to save studies");
    }
  };

  return (
    <ProtectedRoute allowRoles={["admin"]}>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Employees</h1>

        {/* 🔍 Search Input */}

        {addStudies && selectedEmployee && (
          <div
            key={selectedEmployee._id}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] p-4 relative
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-4 gap-3 items-center mb-2"
                  >
                    <div>
                      <Controller
                        name={`education.${index}.grade`}
                        control={control}
                        rules={{ required: "Grade is required" }}
                        render={({ field, fieldState }) => (
                          <NumberField
                            label="Grade"
                            size="small"
                            min={0}
                            step={0.01}
                            value={field.value ? Number(field.value) : null}
                            onBlur={field.onBlur}
                            onValueChange={(value) => field.onChange(value)}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Controller
                        name={`education.${index}.percentage`}
                        control={control}
                        rules={{ required: "Percentage is required" }}
                        render={({ field, fieldState }) => (
                          <NumberField
                            label="Percentage"
                            size="small"
                            min={0}
                            step={0.01}
                            value={field.value ? Number(field.value) : null}
                            onBlur={field.onBlur}
                            onValueChange={(value) => field.onChange(value)}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Controller
                        name={`education.${index}.passingYear`}
                        control={control}
                        rules={{ required: "Passing Year is required" }}
                        render={({ field, fieldState }) => (
                          <NumberField
                            label="Passing Year"
                            size="small"
                            min={0}
                            step={0.01}
                            value={field.value ? Number(field.value) : null}
                            onBlur={field.onBlur}
                            onValueChange={(value) => field.onChange(value)}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </div>

                    <div className="flex gap-1">
                      {/* Add Button (only show on last row) */}
                      {index === fields.length - 1 && (
                        <IconButton
                          color="primary"
                          onClick={() =>
                            append({
                              grade: "",
                              percentage: "",
                              passingYear: "",
                            })
                          }
                        >
                          <AddIcon />
                        </IconButton>
                      )}

                      {/* Delete Button (show if more than 1 row) */}
                      {fields.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => {
                            handleRemoveStudy(index);
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      )}
                    </div>
                  </div>
                ))}
                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outlined"
                    type="button"
                    onClick={handleStudyModalClose}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" variant="contained">
                    Save
                  </Button>
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
                <strong>Name:</strong> {selectedEmployee.userId.firstName}{" "}
                {selectedEmployee.userId.lastName}
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
          <div className="overflow-x-auto flex flex-col">
            <div className="flex gap-2 mt-2">
              <TextField
                type="text"
                size="small"
                placeholder="Search..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="border p-2 rounded mb-4 w-64"
              />
              <FormControl size="small" className="w-40">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </div>
            <table className="min-w-full flex-1 bg-white shadow rounded mt-2">
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
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
