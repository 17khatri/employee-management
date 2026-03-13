import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Task from "@/models/Task";
import Employee from "@/models/Employee";
import { verifyUser } from "@/lib/authMiddleware";

export async function GET(req) {
  const auth = verifyUser(req);
  if (auth.error) return auth.error;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    const userId = auth.user.id;

    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 },
      );
    }

    let matchStage = {
      assignedTo: employee._id,
      deletedAt: null,
    };

    // 📅 Apply year + month filter
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      matchStage.created_at = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const tasks = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: "%d/%m/%Y", date: "$created_at" },
          },
          tasks: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          tasks: 1,
        },
      },
      { $sort: { date: -1 } },
    ]);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Worksheet API Error:", error);

    return NextResponse.json(
      { message: "Failed to fetch worksheet data" },
      { status: 500 },
    );
  }
}

export async function POST() {
  const data = await req.json();

  data.forEach((task) => {
    Task.push({
      id: Date.now(),
      title: task.title,
      description: task.description,
      status: task.status,
    });
  });

  return NextResponse.json({
    message: "Tasks imported successfully",
    count: data.length,
  });
}
