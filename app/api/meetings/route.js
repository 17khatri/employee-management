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

    const userId = auth.user.id;

    const meetings = await Meeting.find({
      $or: [{ createdBy: userId }, { attendees: userId }],
    }).populate("createdBy", "name email");

    const formattedMeetings = meetings.map((m) => {
      const meeting = m.toObject();

      const start = new Date(meeting.date);
      const startTime = new Date(meeting.startTime);
      start.setHours(startTime.getHours(), startTime.getMinutes());

      const end = new Date(meeting.date);
      const endTime = new Date(meeting.endTime);
      end.setHours(endTime.getHours(), endTime.getMinutes());

      return {
        id: meeting._id,
        title: meeting.title,
        start,
        end,
        extendedProps: meeting, // keep full data
      };
    });

    return NextResponse.json(formattedMeetings, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const auth = verifyUser(req);
  if (auth.error) return auth.error;

  try {
    await connectDB();

    const { title, description, date, startTime, endTime, attendees } =
      await req.json();

    if (!title || !date || !startTime || !endTime || !attendees) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    // 🔥 Combine date + time
    const meetingDate = new Date(date);

    const start = new Date(meetingDate);
    const startT = new Date(startTime);
    start.setHours(startT.getHours(), startT.getMinutes());

    const end = new Date(meetingDate);
    const endT = new Date(endTime);
    end.setHours(endT.getHours(), endT.getMinutes());

    // ✅ Conflict check (FIXED)
    const existingMeeting = await Meeting.findOne({
      createdBy: auth.user.id,
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start },
        },
      ],
    });

    if (existingMeeting) {
      return NextResponse.json(
        { message: "You already have a meeting in this time slot" },
        { status: 400 },
      );
    }

    const newMeeting = new Meeting({
      createdBy: auth.user.id,
      title,
      description,
      date: meetingDate,
      startTime: start,
      endTime: end,
      attendees,
    });

    await newMeeting.save();

    return NextResponse.json(newMeeting, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req) {
  const auth = verifyAdmin(req);
  if (auth.error) return auth.error;

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

    // 🔥 Combine date + time (IMPORTANT)
    let updatedFields = {
      title,
      description,
      attendees,
    };

    if (date && startTime && endTime) {
      const meetingDate = new Date(date);

      const start = new Date(meetingDate);
      const startT = new Date(startTime);
      start.setHours(startT.getHours(), startT.getMinutes());

      const end = new Date(meetingDate);
      const endT = new Date(endTime);
      end.setHours(endT.getHours(), endT.getMinutes());

      updatedFields.date = meetingDate;
      updatedFields.startTime = start;
      updatedFields.endTime = end;
    }

    // ✅ Optional: conflict check (recommended)
    if (updatedFields.startTime && updatedFields.endTime) {
      const conflict = await Meeting.findOne({
        _id: { $ne: id },
        createdBy: auth.user.id,
        startTime: { $lt: updatedFields.endTime },
        endTime: { $gt: updatedFields.startTime },
      });

      if (conflict) {
        return NextResponse.json(
          { message: "Time slot conflict with another meeting" },
          { status: 400 },
        );
      }
    }

    const meeting = await Meeting.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    if (!meeting) {
      return NextResponse.json(
        { message: "Meeting not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(meeting, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 500 },
    );
  }
}
