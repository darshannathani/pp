import { dbConnect } from "@/_lib/db";
import Tester from "@/models/user/testerModel";
import Creator from "@/models/user/creatorModel";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import mongoose from "mongoose";
import { Admin } from "@/models";
// import rateLimit from "@/_lib/rateLimit";

dbConnect();

const JWT_SECRET = process.env.TOKEN_SECRET;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin"]),
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // await rateLimit(req, 10, 60); // Limit to 10 requests per minute

    const reqBody = await req.json();
    const parsedData = loginSchema.safeParse(reqBody);

    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData?.error?.issues },
        { status: 400 }
      );
    }

    const { email, password, role } = parsedData.data;

    let existingUser;

    if (role === "admin") {
      existingUser = await Admin.findOne({ email }).session(session);
    } else {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: "Invalid Role" }, { status: 401 });
    }

    if (!existingUser) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: `${role} not found` },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    } else {
      const payload = {
        id: existingUser._id,
        email: existingUser.email,
        role,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

      const response = NextResponse.json(
        {
          message: `${
            role.charAt(0).toUpperCase() + role.slice(1)
          } logged in successfully`,
          role,
          id: existingUser._id,
        },
        { status: 200 }
      );

      response.cookies.set("authorizeToken", token, {
        httpOnly: false,
        secure: true,
        path: "/",
      });
      response.cookies.set("authorizeRole", role, {
        httpOnly: false,
        secure: true,
        path: "/",
      });
      response.cookies.set("authorizeId", existingUser._id.toString(), {
        httpOnly: false,
        secure: true,
        path: "/",
      });

      await session.commitTransaction();
      session.endSession();

      return response;
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error:", error.message);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}
