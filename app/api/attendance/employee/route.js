import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import { verifyUser } from "@/lib/authMiddleware";

export async function GET(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const userId = auth.user.id;
    const employee = await Employee.findOne({ userId });
    const employeeId = employee._id;
    const now = new Date();
    const attendance = await Attendance.find({ employeeId });

    console.log(attendance, "attendance", now, "now");
    return NextResponse.json(attendance, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
