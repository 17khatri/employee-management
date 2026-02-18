import "@/models";
import Department from "@/models/Department";
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
    const departments = await Department.find();

    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();

    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        { message: "Name and description are required" },
        { status: 400 },
      );
    }

    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return NextResponse.json(
        { message: "Department already exists" },
        { status: 409 },
      );
    }

    const newDepartment = new Department({ name, description });
    await newDepartment.save();

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
