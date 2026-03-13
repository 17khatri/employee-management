import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Project from "@/models/Projects";
import Task from "@/models/Task";
import { verifyAdmin, verifyUser } from "@/lib/authMiddleware";

// GET all projects
export async function GET(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const projects = await Project.find({ deletedAt: null }).populate({
      path: "tasks",
      select: "title description assignedTo",
      populate: {
        path: "assignedTo",
        select: "userId",
        populate: {
          path: "userId",
          select: "firstName lastName email",
        },
      },
    });
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new project
export async function POST(req) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();

    const { title, description, assignedTo, startDate, endDate } =
      await req.json();

    if (!title || !assignedTo || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Title, assignedTo, startDate and endDate are required" },
        { status: 400 },
      );
    }

    const newProject = new Project({
      title,
      description,
      assignedTo,
      startDate,
      endDate,
    });

    await newProject.save();

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();

    const { id, title, description, assignedTo, startDate, endDate } =
      await req.json();

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { title, description, assignedTo, startDate, endDate },
      { new: true },
    );

    if (!updatedProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();

    const { id } = await req.json();

    const now = new Date();

    const tasks = await Task.updateMany({ projectId: id }, { deletedAt: now });

    const deletedProject = await Project.findByIdAndUpdate(id, {
      deletedAt: now,
    });

    if (!deletedProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Project and tasks under that project deleted" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
