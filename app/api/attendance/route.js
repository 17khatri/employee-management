import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import { verifyAdmin, verifyUser } from "@/lib/authMiddleware";

export async function GET(req) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();

    const attendance = await Attendance.find().populate({
      path: "employeeId",
      populate: { path: "userId", select: "firstName lastName email" },
    });

    return NextResponse.json(attendance, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  if (auth.user.role === "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const userId = auth.user.id;
    const employee = await Employee.findOne({ userId });
    const employeeId = employee._id;
    const { inTime, outTime } = await req.json();
    const now = new Date();

    if (!inTime) {
      return NextResponse.json({ message: "inTime and outTime is required" });
    }

    const newAttendance = new Attendance({
      inTime,
      outTime,
      employeeId: employeeId,
      date: now,
    });

    await newAttendance.save();

    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const { id, inTime, outTime } = await req.json();

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      {
        inTime,
        outTime,
      },
      { new: true },
    );

    if (!updatedAttendance) {
      return NextResponse.json(
        { message: "attendance not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(updatedAttendance, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
