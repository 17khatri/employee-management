import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { ROLES } from "../app/constants/roles";

export const verifyAdmin = (req) => {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      };
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== ROLES.ADMIN) {
      return {
        error: NextResponse.json(
          { message: "Admin access only" },
          { status: 403 },
        ),
      };
    }

    return { user: decoded };
  } catch (error) {
    return {
      error: NextResponse.json({ message: "Invalid token" }, { status: 401 }),
    };
  }
};
