import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Ticket } from "@/models";

export async function GET(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tickets = await Ticket.find().session(session);
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}
