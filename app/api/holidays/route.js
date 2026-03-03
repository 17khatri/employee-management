import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/authMiddleware";
import Holiday from "@/models/Holiday";

export async function GET() {
  try {
    await connectDB();

    const holidays = await Holiday.find();

    return NextResponse.json(holidays, { status: 200 });
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
    const { name, date } = await req.json();
    const exists = await Holiday.findOne({ date });

    if (exists) {
      return NextResponse.json(
        { message: "Holiday already exists for this date" },
        { status: 400 },
      );
    }

    if (!name || !date) {
      return NextResponse.json(
        { message: "name and date is required" },
        { status: 400 },
      );
    }
    const newHolidays = new Holiday({
      name,
      date,
    });
    await newHolidays.save();
    return NextResponse.json(newHolidays, { status: 201 });
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

    if (!id) {
      return NextResponse.json({ message: "Id is required" }, { status: 404 });
    }

    const deletedHoliday = await Holiday.findByIdAndDelete(id);

    if (!deletedHoliday) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Holiday deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
