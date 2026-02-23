import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Study from "@/models/Studies";
import { verifyAdmin } from "@/lib/authMiddleware";

export async function GET(req, context) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }

  try {
    await connectDB();

    const { id } = await context.params;

    console.log("Employee ID:", id);

    if (!id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 },
      );
    }

    const studies = await Study.find({ employeeId: id });

    return NextResponse.json(studies, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
