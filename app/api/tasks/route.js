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

    const tasks = await Task.find({ deletedAt: null })
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

export async function POST(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  if (auth.user.role === "admin") {
    return NextResponse.json(
      { message: "Admin can not create task" },
      { status: 401 },
    );
  }

  try {
    await connectDB();

    const { title, description, status, projectId, estimationHours } =
      await req.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 },
      );
    }
    const userId = auth.user.id;
    const employee = await Employee.findOne({ userId });
    const newTask = new Task({
      title,
      description,
      status,
      assignedTo: employee._id,
      projectId,
      estimationHours,
    });

    await newTask.save();
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }

  if (auth.user.role === "admin") {
    return NextResponse.json(
      { message: "Admin can not update task" },
      { status: 401 },
    );
  }
  const userId = auth.user.id;

  try {
    await connectDB();

    const { id } = await req.json();
    const now = new Date();

    const employee = await Employee.findOne({ userId });
    const task = await Task.findOne({ _id: id });
    if (task.assignedTo.toString() !== employee._id.toString()) {
      return NextResponse.json(
        {
          message: "You can delete your own task only",
        },
        { status: 401 },
      );
    }

    const deletedTask = await Task.findByIdAndUpdate(id, {
      deletedAt: now,
    });

    if (!deletedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  if (auth.user.role === "admin") {
    return NextResponse.json(
      { message: "Admin can not update task" },
      { status: 401 },
    );
  }
  const userId = auth.user.id;

  try {
    await connectDB();

    const {
      id,
      title,
      description,
      status,
      assignedTo,
      projectId,
      estimationHours,
      actualHours,
    } = await req.json();
    const employee = await Employee.findOne({ userId });
    const task = await Task.findOne({ _id: id });

    if (task.assignedTo.toString() !== employee._id.toString()) {
      return NextResponse.json(
        {
          message: "You can update your own task only",
        },
        { status: 401 },
      );
    }
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title,
        description,
        status,
        assignedTo,
        projectId,
        estimationHours,
        actualHours,
      },
      { new: true },
    );

    if (!updatedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
