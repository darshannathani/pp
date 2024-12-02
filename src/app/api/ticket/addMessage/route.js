import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Ticket } from "@/models";

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { ticketId, message } = await req.json();
    console.log(ticketId, message);
    const ticket = await Ticket.findById(ticketId).session(session);
    console.log(message)
    if(!ticket) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: "Ticket not found" }, { status: 400 });
    }
    
    ticket.messages.push(message);

    await ticket.save({ session });

    await session.commitTransaction(); // Ensure the transaction is committed
    session.endSession();
    return NextResponse.json({ message: "Message added" }, { status: 201 });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error("Error in POST request:", error.message);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}
