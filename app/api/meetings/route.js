import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Meeting from "@/models/Meeting";
import { verifyAdmin, verifyUser } from "@/lib/authMiddleware";

// GET all meetings
export async function GET(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();
    const user = auth.user;
    console.log("Authenticated User:", user);
    const userId = auth.user.id;
    console.log("User ID:", userId);
    const meetings = await Meeting.find({
      $or: [{ createdBy: userId }, { attendees: userId }],
    }).populate("createdBy", "name email");

    return NextResponse.json(meetings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();

    const { title, description, date, startTime, endTime, attendees } =
      await req.json();

    if (!title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { message: "Title, date, start time, and end time are required" },
        { status: 400 },
      );
    }

    const newMeeting = new Meeting({
      createdBy: auth.user.id,
      title,
      description,
      date,
      startTime,
      endTime,
      attendees,
    });

    await newMeeting.save();

    return NextResponse.json(newMeeting, { status: 201 });
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

    const { id, title, description, date, startTime, endTime, attendees } =
      await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Meeting ID is required" },
        { status: 400 },
      );
    }

    const meeting = await Meeting.findByIdAndUpdate(
      id,
      {
        title,
        description,
        date,
        startTime,
        endTime,
        attendees,
      },
      { new: true },
    );
    if (!meeting) {
      return NextResponse.json(
        { message: "Meeting not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(meeting, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
