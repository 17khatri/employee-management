import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Holiday from "@/models/Holiday";

export async function GET() {
  try {
    await connectDB();

    const today = new Date();

    // Start of today (to ignore past time)
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    // End of current month
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const holidays = await Holiday.find({
      deletedAt: null,
      date: {
        $gte: startOfToday, // ✅ upcoming only
        $lte: endOfMonth, // ✅ within this month
      },
    }).sort({ date: 1 }); // optional: ascending order

    return NextResponse.json(holidays, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 500 },
    );
  }
}
