import { dbConnect } from "@/_lib/db";
import Tester from "@/models/user/testerModel";
import Creator from "@/models/user/creatorModel";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import mongoose from "mongoose";
// import { createWallet } from "@/_lib/walletService";

dbConnect();

const userSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  mobileNo: z.string().min(10),
  gender: z.enum(["Male", "Female", "Others"]),
  password: z.string().min(6),
  dob: z.string(),
  country: z.string().min(2),
  role: z.enum(["tester", "creator"]),
  pincode: z.string().optional(),
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const reqBody = await req.json();
    const parsedData = userSchema.safeParse(reqBody);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      mobileNo,
      gender,
      password,
      dob,
      country,
      role,
      pincode,
    } = parsedData.data;
    const DOB = new Date(dob);
    let existingUserByEmail;
    let existingUserByMobile;

    if (role === "tester") {
      existingUserByEmail = await Tester.findOne({ email }).session(session);
      existingUserByMobile = await Tester.findOne({ mobileNo }).session(
        session
      );

      if (existingUserByEmail || existingUserByMobile) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "Email or mobile number already registered." },
          { status: 409 }
        );
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newTester = new Tester({
          firstName,
          lastName,
          email,
          mobileNo,
          gender,
          password: hashedPassword,
          pincode,
          dob: DOB,
          country,
        });
        await newTester.save({ session });
        await session.commitTransaction();
        session.endSession();
        // createWallet("Tester", newTester._id);
        return NextResponse.json(
          { message: "Tester registered successfully" },
          { status: 201 }
        );
      }
    } else {
      existingUserByEmail = await Creator.findOne({ email }).session(session);
      existingUserByMobile = await Creator.findOne({ mobileNo }).session(
        session
      );

      if (existingUserByEmail || existingUserByMobile) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "Email or mobile number already registered." },
          { status: 409 }
        );
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newCreator = new Creator({
          firstName,
          lastName,
          email,
          mobileNo,
          gender,
          password: hashedPassword,
          dob: DOB,
          country,
        });
        await newCreator.save({ session });
        await session.commitTransaction();
        session.endSession();
        // createWallet("Creator", newCreator._id);
        return NextResponse.json(
          { message: "Creator registered successfully" },
          { status: 201 }
        );
      }
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return NextResponse.json(
      { message: "An error occurred", error: err.message },
      { status: 500 }
    );
  }
}
