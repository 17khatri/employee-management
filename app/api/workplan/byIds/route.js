import "@/models";
import Employee from "@/models/Employee";
import WorkPlan from "@/models/WorkPlan";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/authMiddleware";
import Task from "@/models/Task";

export async function POST(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }

  try {
    await connectDB();
    const { ids, date } = await req.json();

    const tasks = await Promise.all(
      ids.map(async (item) => {
        const task = await Task.findById(item.id);
        return task
          ? {
              ...task.toObject(),
              estimationHours: item.estimationHours,
            }
          : 0;
      }),
    );

    const validTasks = tasks.filter((task) => task !== null);

    const workPlansData = validTasks.map((task) => ({
      taskId: task._id,
      date: date,
    }));

    const workPlans = await WorkPlan.insertMany(workPlansData);

    return NextResponse.json(workPlans, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
