import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Task from "@/models/Task";
import Employee from "@/models/Employee";
import Projects from "@/models/Projects";
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

// export async function POST(req) {
//   const auth = verifyUser(req);
//   if (auth.error) return auth.error;

//   try {
//     await connectDB();

//     const data = await req.json();

//     const newTasks = data;

//     if (newTasks.length > 0) {
//       const taskData = await Promise.all(
//         newTasks.map(async (item) => {
//           const project = await Projects.findOne({ title: item.Project });

//           if (!project) {
//             throw new Error(`Project not found: ${item.Project}`);
//           }

//           return {
//             title: item.Title,
//             description: item.Description,
//             status: item.Status,
//             estimationHours: item.EstimatedHours,
//             projectId: project?._id,
//           };
//         }),
//       );

//       await Task.insertMany(taskData);
//     }

//     return NextResponse.json({
//       message: "Tasks imported successfully",
//       count: data.length,
//     });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function POST(req) {
  const auth = verifyUser(req);
  if (auth.error) return auth.error;

  const userId = auth.user.id;

  try {
    await connectDB();
    const employee = await Employee.findOne({ userId });
    const employeeId = employee._id;

    const newTasks = await req.json();

    if (!newTasks?.length) {
      return NextResponse.json({ message: "No tasks provided" });
    }

    // Get all projects once
    const projects = await Projects.find({});
    const projectMap = {};

    projects.forEach((p) => {
      projectMap[p.title] = p._id;
    });

    const taskData = [];
    const skippedTasks = [];

    for (const item of newTasks) {
      const projectId = projectMap[item.Project.trim()];

      if (!projectId) {
        skippedTasks.push(item.Project);
        continue;
      }

      const [day, month, year] = item.Date.split("/");
      const createdAt = new Date(Date.UTC(year, month - 1, day));

      taskData.push({
        title: item.Title,
        description: item.Description,
        status: item.Status,
        estimationHours: item.EstimatedHours,
        projectId: projectId,
        assignedTo: employeeId,
        created_at: createdAt,
      });
    }

    if (taskData.length) {
      await Task.insertMany(taskData);
    }

    return NextResponse.json({
      message: "Tasks imported successfully",
      inserted: taskData.length,
      skippedProjects: skippedTasks,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
