import "@/models";
import Employee from "@/models/Employee";
import WorkPlan from "@/models/WorkPlan";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
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

    // ✅ Get today's start and end
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const workPlans = await WorkPlan.find({
      date: {
        $gte: todayStart,
        $lte: todayEnd,
      },
      deletedAt: null,
    }).populate({
      path: "taskId",
      match: {
        assignedTo: employeeId,
        deletedAt: null,
      },
      select: "title description status projectId estimationHours actualHours",
      populate: { path: "projectId", select: "title" },
    });

    return NextResponse.json(workPlans, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }

  try {
    await connectDB();
    const { taskId, date } = await req.json();

    if (!taskId || !date) {
      return NextResponse.json(
        {
          message: "task Id and date is required",
        },
        {
          status: 400,
        },
      );
    }

    const newWokrPlan = new WorkPlan({
      taskId,
      date,
    });

    await newWokrPlan.save();
    return NextResponse.json(newWokrPlan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
