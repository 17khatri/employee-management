import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyUser } from "@/lib/authMiddleware";

export async function PATCH(req) {
  try {
    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }
    const userId = auth.user.id;
    await connectDB();
    console.log("request comes here");
    const { firstName, lastName, email } = await req.json();
    console.log(firstName, "firstName");
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
      },
      { new: true },
    );
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id.toString(),
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: "admin",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
