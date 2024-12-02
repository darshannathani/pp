import mongoose from "mongoose";
import { Tester, Creator } from "@/models"
import { NextResponse } from "next/server";
import { z } from "zod";

const userDetailsSchema = z.object({
  id: z.string(),
  role: z.enum(["tester", "creator"]),
});

export async function GET(req) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const role = searchParams.get("role");

    const parsedData = userDetailsSchema.safeParse({ id, role });

    if (!parsedData.success) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Invalid request parameters", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { id: userId, role: userRole } = parsedData.data;

    let user;
    if (userRole === "tester") {
      user = await Tester.findById(userId).session(session);
    } else if (userRole === "creator") {
      user = await Creator.findById(userId).session(session);
    }

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} not found`, id: userId }, { status: 404 });
    }

    const response = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNo: user.mobileNo,
      gender: user.gender,
      role: user.role,
      dob: user.dob,
      country: user.country,
      pincode: user.pincode,
      total_task: user.taskHistory.length,
    };

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}