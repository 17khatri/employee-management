import "@/models";
import Leave from "@/models/Leave";
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
    const leaves = await Leave.find({
      userId: userId,
      deletedAt: null,
    });

    return NextResponse.json(leaves, { status: 200 });
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

    const body = await req.json();
    const userId = auth.user.id;

    const { date, leaveType, reason } = body;

    const exsitingLeave = await Leave.findOne({
      userId: userId,
      date: date,
      deletedAt: null,
    });

    if (exsitingLeave) {
      return NextResponse.json(
        {
          message: "You already apply leave for this day",
        },
        { status: 409 },
      );
    }

    const newLeave = await Leave.create({
      userId: auth.user.id,
      date,
      leaveType,
      reason,
    });

    return NextResponse.json(newLeave, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const { id, date, leaveType, reason } = await req.json();
    if (!id) {
      return NextResponse.json(
        { message: "Leave id is required" },
        { status: 400 },
      );
    }
    const leave = await Leave.findByIdAndUpdate(
      id,
      {
        date,
        leaveType,
        reason,
      },
      { new: true },
    );
    if (!leave) {
      return NextResponse.json(
        { message: "Meeting not found" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { data: leave, message: "Leave updates successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const { id } = await req.json();
    const now = new Date();

    if (!id) {
      return NextResponse.json(
        { message: "Leave id is required" },
        { status: 400 },
      );
    }

    const deletedLeave = await Leave.findByIdAndUpdate(id, {
      deletedAt: now,
    });

    if (!deletedLeave) {
      return NextResponse.json({ message: "leave not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Leave deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
