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
    const { date, leaveType } = body;

    const newLeave = await Leave.create({
      userId: auth.user.id,
      date,
      leaveType,
    });

    return NextResponse.json(newLeave, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
