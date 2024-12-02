import mongoose from "mongoose";
import { Tester, Creator } from "@/models"
import { NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  userId: z.string(),
  role: z.enum(["tester", "creator"]),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string(),
});

export async function PATCH(req) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const body = await req.json();
    const parsedData = updateProfileSchema.safeParse(body);

    if (!parsedData.success) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Invalid request parameters", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { userId, role, firstName, lastName, gender } = parsedData.data;

    let user;
    if (role === "tester") {
      user = await Tester.findByIdAndUpdate(
        userId,
        { firstName, lastName, gender },
        { new: true, session }
      );
    } else if (role === "creator") {
      user = await Creator.findByIdAndUpdate(
        userId,
        { firstName, lastName, gender },
        { new: true, session }
      );
    }

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} not found`, id: userId }, { status: 404 });
    }

    const response = {
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
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