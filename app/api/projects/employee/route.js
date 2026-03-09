import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Project from "@/models/Projects";
import Employee from "@/models/Employee";
import { verifyUser } from "@/lib/authMiddleware";

export async function GET(req) {
  const auth = verifyUser(req);
  const userId = auth.user.id;
  if (auth.error) {
    return auth.error;
  }
  try {
    connectDB();
    const employee = await Employee.findOne({ userId });
    const employeeId = employee._id;
    const project = await Project.find({
      assignedTo: employeeId,
      deletedAt: null,
    }).populate({
      path: "tasks",
      select: "title description assignedTo",
      populate: {
        path: "assignedTo",
        select: "userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      },
    });

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
