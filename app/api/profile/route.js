import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyUser } from "@/lib/authMiddleware";

export async function GET(req) {
  const auth = verifyUser(req);
  const userId = auth.user.id;
  try {
    await connectDB();
    if (auth.role === "admin") {
      const user = await User.findById(userId).select("-password");
      return NextResponse.json(user, { status: 200 });
    } else {
      const user = await User.findById(userId)
        .select("-password")
        .populate({
          path: "employee",
          select: "phone departmentId salary profilePhoto birthDate gender",
          populate: { path: "departmentId", select: "name" },
        });
      return NextResponse.json(user, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
