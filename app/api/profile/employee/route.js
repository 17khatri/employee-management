import "@/models";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/User";
import Employee from "@/models/Employee";
import { verifyUser } from "@/lib/authMiddleware";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

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
    const formData = await req.formData();

    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const salary = formData.get("salary");
    const birthDate = formData.get("birthDate");
    const gender = formData.get("gender");
    const file = formData.get("profilePhoto");

    let imageUrl;
    let removePhoto = file === "";
    const existingEmployee = await Employee.findOne({ userId });

    // ✅ REMOVE PHOTO
    if (removePhoto && existingEmployee?.profilePhoto) {
      const oldImagePath = path.join(
        process.cwd(),
        "public",
        existingEmployee.profilePhoto,
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      imageUrl = ""; // remove from DB
    }

    if (file && typeof file !== "string" && file.name && file.size > 0) {
      // 1️⃣ Get existing employee first

      // 2️⃣ Delete old profile photo if exists
      if (existingEmployee?.profilePhoto) {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          existingEmployee.profilePhoto,
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // 3️⃣ Save new file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(process.cwd(), "public/uploads", fileName);

      await writeFile(filePath, buffer);

      imageUrl = `/uploads/${fileName}`;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser._id.toString() !== userId) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 400 },
      );
    }

    const updatedUserDetails = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
      },
      { new: true },
    );

    const updateEmployeeData = {
      phone,
      salary,
      birthDate,
      gender,
    };
    if (imageUrl !== undefined) {
      updateEmployeeData.profilePhoto = imageUrl;
    }
    const updatedEmployeeDetails = await Employee.findOneAndUpdate(
      { userId: userId },
      updateEmployeeData,
      { new: true },
    );
    if (!updatedUserDetails || !updatedEmployeeDetails) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: updatedUserDetails._id.toString(),
      firstName: updatedUserDetails.firstName,
      lastName: updatedUserDetails.lastName,
      email: updatedUserDetails.email,
      role: updatedUserDetails.role,
      phone: updatedEmployeeDetails.phone,
      salary: updatedEmployeeDetails.salary,
      profilePhoto: updatedEmployeeDetails.profilePhoto,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
