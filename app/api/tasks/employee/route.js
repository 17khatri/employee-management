import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Task from "@/models/Task";
import Employee from "@/models/Employee";
import { verifyUser } from "@/lib/authMiddleware";

// GET all tasks
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

    const tasks = await Task.find({ deletedAt: null, assignedTo: employeeId })
      .populate({
        path: "assignedTo",
        populate: { path: "userId", select: "firstName lastName email" },
      })
      .populate({
        path: "projectId",
        select: "title",
      });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
