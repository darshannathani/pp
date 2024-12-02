import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Creator, Ticket, Task } from "@/models";

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, role } = await req.json();

    let tickets = [];

    if (role === "tester") {
      // Find tickets for the tester
      const fetchedTickets = await Ticket.find({ testerId: userId }).session(session);

      // Create a new array of tickets with their respective heading
      tickets = await Promise.all(fetchedTickets.map(async (ticket) => {
        const task = await Task.findOne({ _id: ticket.taskId }, { heading: 1, _id: 0 });
        return {
          ...ticket.toObject(), // Convert Mongoose document to plain object
          heading: task ? task.heading : null
        };
      }));

    } else if (role === "creator") {
      // Fetch creator and their task history
      const creator = await Creator.findById(userId).session(session);
      const taskIds = creator.taskHistory.map((task) => task.task);

      // Find all tickets for the creator's tasks
      const fetchedTickets = await Ticket.find({ taskId: { $in: taskIds } }).session(session);


      // Create a new array of tickets with their respective heading
      tickets = await Promise.all(fetchedTickets.map(async (ticket) => {
        const task = await Task.findOne({ _id: ticket.taskId }, { heading: 1, _id: 0 });
        return {
          ...ticket.toObject(), // Convert Mongoose document to plain object
          heading: task ? task.heading : null
        };
      }));

    } else {
      // If role is not found, return an error message
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: "Role not found" }, { status: 400 });
    }

    // Commit the transaction after successful role handling
    await session.commitTransaction();
    session.endSession();

    // Return the tickets with headings found
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