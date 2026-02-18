import "@/models";
import Employee from "@/models/Employee";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/authMiddleware";

export async function GET(req) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const employees = await Employee.find()
      .populate("userId", "name email")
      .populate("departmentId", "name");

    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 },
      );
    }

    const deletedEmployee = await Employee.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Employee deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
