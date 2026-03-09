import "@/models";
import Leave from "@/models/Leave";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/authMiddleware";

export async function GET(req) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const leavess = await Leave.find({ isDeleted: false });
    const leaves = await Leave.find().populate({
      path: "userId",
      select: "firstName lastName email",
    });
    console.log(leaves);
    return NextResponse.json(leaves, { status: 200 });
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
    const { id, leaveStatus } = await req.json();
    if (!id) {
      return NextResponse.json(
        { message: "Leave id is required" },
        { status: 400 },
      );
    }
    const leave = await Leave.findByIdAndUpdate(
      id,
      {
        leaveStatus,
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
