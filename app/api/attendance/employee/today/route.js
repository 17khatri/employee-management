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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const attendance = await Attendance.find({
      employeeId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    return NextResponse.json(attendance, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
