import "@/models";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyAdmin, verifyUser } from "@/lib/authMiddleware";
import { ROLES } from "@/app/constants/roles";
import Employee from "@/models/Employee";
import crypto from "crypto";
import { sendEmail } from "@/lib/sendEmail";

function generatePassword(length = 8) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

// GET all users
export async function GET(req) {
  const auth = verifyUser(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();

    const users = await User.find({ deletedAt: null })
      .select("-password")
      .populate({
        path: "employee",
        select: "phone departmentId salary birthDate gender",
        populate: { path: "departmentId", select: "name" },
      });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// CREATE user
export async function POST(req) {
  const auth = verifyAdmin(req);
  if (auth.error) {
    return auth.error;
  }
  try {
    await connectDB();

    const {
      firstName,
      lastName,
      email,
      isActive,
      role,
      phone,
      departmentId,
      salary,
      birthDate,
      gender,
    } = await req.json();

    if (!firstName || !lastName || !email || role === undefined) {
      return NextResponse.json(
        { message: "firstName, lastName, email and role are required" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 },
      );
    }

    const plainPassword = generatePassword();

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      role,
      isActive,
      password: hashedPassword,
    });

    if (role === ROLES.EMPLOYEE) {
      if (!phone || !departmentId || !salary || !birthDate || !gender) {
        return NextResponse.json(
          {
            message:
              "phone, departmentId, salary, birthDate and gender are required",
          },
          { status: 400 },
        );
      }

      await Employee.create({
        userId: user._id,
        phone,
        departmentId,
        salary,
        birthDate,
        gender,
      });

      // 🔐 Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // (Optional but recommended) hash token before saving
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetToken = hashedToken;
      user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
      await user.save();

      // Create reset link
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;

      // Send email
      await sendEmail(
        user.email,
        "Set Your Password",
        `
      <h2>Welcome ${user.firstName}</h2>
      <p>Your employee account has been created.</p>
      <p>Please click the link below to set your password:</p>
      <a href="${resetLink}" target="_blank">Set Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
      );
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isActive: user.isActive,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const auth = verifyAdmin(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const {
      id,
      firstName,
      lastName,
      email,
      isActive,
      role,
      phone,
      salary,
      birthDate,
      gender,
    } = body;

    /* =====================================================
       🔹 ADMIN UPDATE (JSON)
    ====================================================== */

    if (role === "admin") {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          firstName,
          lastName,
          email,
          isActive,
          role,
        },
        { new: true },
      );

      if (!updatedUser) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id.toString(),
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
        },
      });
    }
    /* =====================================================
       🔹 EMPLOYEE UPDATE (FormData + Image)
    ====================================================== */
    if (role === "employee") {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          firstName,
          lastName,
          email,
          isActive,
        },
        { new: true },
      );

      const updateEmployeeData = {
        phone,
        salary,
        birthDate,
        gender,
      };

      const updatedEmployee = await Employee.findOneAndUpdate(
        { userId: id },
        updateEmployeeData,
        { new: true },
      );

      if (!updatedUser || !updatedEmployee) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        message: "Employee profile updated successfully",
        userDetails: updatedUser,
        employeeDetails: updatedEmployee,
      });
    }

    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
