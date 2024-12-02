import { dbConnect } from "@/_lib/db";
import Tester from "@/models/user/testerModel";
import Creator from "@/models/user/creatorModel";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";

dbConnect();

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const resetPasswordSchema = z.object({
      password: z.string().min(6),
      token: z.string(),
      role: z.enum(["tester", "creator"]),
    });

    const reqBody = await req.json();
    const parsedData = resetPasswordSchema.safeParse(reqBody);

    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData?.error?.issues },
        { status: 400 }
      );
    }
    const { token, password, role } = parsedData.data;

    let user;
    if (role === "tester") {
      user = await Tester.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      }).session(session);
    } else if (role === "creator") {
      user = await Creator.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      }).session(session);
    }

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Password reset token is invalid or has expired" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { message: "Password has been reset" },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
