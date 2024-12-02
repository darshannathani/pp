import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Transaction } from "@/models";

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reqBody = await req.json();

    // Check for empty body
    if (!reqBody) {
      throw new Error("Body should not be empty");
    }

    const { userId } = reqBody;

    // Check for missing userId
    if (!userId) {
      throw new Error("UserId is required");
    }

    // Fetch transactions
    const transactions = await Transaction.find({ userId })
      .session(session)
      .sort({ createdAt: -1 }); // Sort by 'createdAt' in descending order

    // Commit transaction if everything is okay
    await session.commitTransaction();
    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error("Error:", error.message);

    // If a transaction is aborted, no commit is needed
    await session.abortTransaction(); // Make sure to abort on error
    return NextResponse.json(
      { message: error.message },
      { status: 400 } // Change this to appropriate status code
    );
  } finally {
    // Always end the session
    session.endSession();
  }
}
