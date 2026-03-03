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
    const projects = await Project.find().populate({
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

    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 },
      );
    }

    const newProject = new Project({
      title,
      description,
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

    const { id, title, description } = await req.json();

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { title, description },
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

    const tasks = await Task.updateMany(
      { projectId: id },
      { isDeleted: true, deletedAt: now },
    );

    const now = new Date();

    const deletedProject = await Project.findByIdAndUpdate(id, {
      isDeleted: true,
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
