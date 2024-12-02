import { dbConnect } from "@/_lib/db";
import Tester from "@/models/user/testerModel";
import Creator from "@/models/user/creatorModel";
import { sendResetPasswordEmail } from "@/_lib/mail";
import cryptoRandomString from "crypto-random-string";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
// import rateLimit from "@/_lib/rateLimit";

dbConnect();

const RESET_TOKEN_EXPIRATION = process.env.RESET_TOKEN_EXPIRATION || 3600000; // 1 hour

export async function POST(req) {
  const session = await mongoose.startSession();

  try {
    // await rateLimit(req, 5, 60); // Limit to 5 requests per minute

    session.startTransaction();

    const forgotPasswordSchema = z.object({
      email: z.string().email(),
      role: z.enum(["tester", "creator"]),
    });

    const reqBody = await req.json();
    const parsedData = forgotPasswordSchema.safeParse(reqBody);

    if (!parsedData.success) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData?.error?.issues },
        { status: 400 }
      );
    }

    const { email, role } = parsedData.data;

    let user;
    if (role === "tester") {
      user = await Tester.findOne({ email }).session(session);
    } else if (role === "creator") {
      user = await Creator.findOne({ email }).session(session);
    }

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const resetToken = cryptoRandomString({ length: 20 });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + RESET_TOKEN_EXPIRATION;

    await user.save({ session });

    await sendResetPasswordEmail(user.email, resetToken, role);

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { message: "Password reset email sent" },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error during password reset:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
