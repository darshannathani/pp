import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Ticket } from "@/models";

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { ticketId } = await req.json();
    console.log(ticketId);
    // Ensure async operation is awaited
    const ticket = await Ticket.findById(ticketId).session(session);
    
    if (!ticket) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: "Ticket not found" }, { status: 400 });
    }

    ticket.isOpen = false;
    await ticket.save({ session });

    await session.commitTransaction(); // Ensure the transaction is committed
    session.endSession();
    return NextResponse.json({ message: "Ticket closed" }, { status: 201 });
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
