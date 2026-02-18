import Role from "@/models/Role";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const roles = await Role.find();

    return NextResponse.json(roles, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 },
      );
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return NextResponse.json(
        { message: "Role already exists" },
        { status: 409 },
      );
    }

    const newRole = new Role({ name });
    await newRole.save();

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
