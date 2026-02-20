import "@/models;";
import Study from "@/models/Studies";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyAdmin, verifyUser } from "@/lib/authMiddleware";

export async function GET(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const studies = await Study.find();

    return NextResponse.json(studies, { status: 200 });
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

    const { employeeId, grade, percentage, passingYear } = await req.json();

    if (!employeeId || !grade || !passingYear) {
      return NextResponse.json(
        { message: "Employee ID, grade, and passing year are required" },
        { status: 400 },
      );
    }

    const newStudy = new Study({
      employeeId,
      grade,
      percentage,
      passingYear,
    });

    await newStudy.save();

    return NextResponse.json(newStudy, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
