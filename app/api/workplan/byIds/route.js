import "@/models";
import WorkPlan from "@/models/WorkPlan";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/authMiddleware";

export async function POST(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }

  try {
    await connectDB();
    const { ids, date } = await req.json();

    const taskIds = ids.map((item) => item.id);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Delete old records for same taskIds and date
    await WorkPlan.deleteMany({
      taskId: { $in: taskIds },
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Prepare new records
    const workPlansData = ids.map((item) => ({
      taskId: item.id,
      date: date,
      estimationHours: item.estimationHours ?? 0,
    }));

    const workPlans = await WorkPlan.insertMany(workPlansData);

    return NextResponse.json(workPlans, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
