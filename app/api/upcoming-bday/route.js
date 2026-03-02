import "@/models";
import Employee from "@/models/Employee";
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

    const currentMonth = new Date().getMonth() + 1;

    const employees = await Employee.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: "$birthDate" }, currentMonth],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          birthDate: 1,
          gender: 1,
          phone: 1,
          "user._id": 1,
          "user.firstName": 1,
          "user.lastName": 1,
          "user.email": 1,
        },
      },
    ]);

    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
