import mongoose from "mongoose";
import Ticket from "@/models/ticket/ticketModel";  // Assuming Ticket model is exported from your models
import { NextResponse } from "next/server";
import { z } from "zod";
import { Task , Tester } from "@/models"

// Define the schema for creating a Ticket
const createTicketSchema = z.object({
  taskId: z.string(),
  testerId: z.string(),
  messages: z.array(
    z.object({
      content: z.string().min(1),
      sender: z.enum(["tester", "admin"]),
    })
  )
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Parse and validate the request data
    const parsedData = createTicketSchema.safeParse(await req.json());
    if (!parsedData.success) {
      throw new Error(parsedData.error.message);
    }

    const { taskId, testerId, messages, isOpen } = parsedData.data;

    // Check if the task and tester exist
    const [taskExists, testerExists] = await Promise.all([
      Task.findById(taskId).session(session),
      Tester.findById(testerId).session(session),
    ]);
    console.log(taskExists)
    if (!taskExists) {
      await session.abortTransaction();
      await session.endSession();
    }

    const ticketExists = await Ticket.findOne({ taskId, testerId }).session(session);
    if (ticketExists) {
      await session.abortTransaction();
      await session.endSession();
      return NextResponse.json(
        { message: "Ticket already exists" },
        { status: 400 }
      );
    }

    if (!testerExists) {
      await session.abortTransaction();
      await session.endSession();
      return NextResponse.json(
        {messages : "tester is not exists"},
        {status : 400}
      )
    }

    // Create a new Ticket instance
    const ticket = new Ticket({
      taskId,
      testerId,
      messages,
      isOpen,
    });
    console.log(ticket)
    // Save the Ticket
    const savedTicket = await ticket.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        message: "Ticket created successfully",
        ticket: savedTicket,
      },
      { status: 200 }
    );
  } catch (error) {
    // Roll back the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}
