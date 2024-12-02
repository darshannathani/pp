import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Tester, Task, YoutubeTask, YoutubeResponse } from "@/models";
import { z } from "zod";
import { creditWallet } from "@/_lib/walletService";
import { dbConnect } from "@/_lib/db";

dbConnect();
const youtubeResponseSchema = z.object({
  taskId: z.string(),
  testerId: z.string(),
  response: z.string(),
});

export async function POST(req) {
  const session = await mongoose.startSession(); // Start the session
  session.startTransaction(); // Start a transaction

  try {
    const parsedData = youtubeResponseSchema.safeParse(await req.json());
    if (!parsedData.success) {
      await session.abortTransaction(); // Abort if validation fails
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { taskId, testerId, response } = parsedData.data;

    // Fetch task within the session
    const task = await Task.findOne({
      type: "YoutubeTask",
      _id: taskId,
    }).session(session);
    if (!task) {
      await session.abortTransaction(); // Abort if task not found
      return NextResponse.json(
        { message: "Associated task not found", taskId },
        { status: 404 }
      );
    }

    // Fetch specific YoutubeTask within the session
    const taskExists = await YoutubeTask.findById(task.specificTask).session(
      session
    );
    if (!taskExists) {
      await session.abortTransaction(); // Abort if YouTube task not found
      return NextResponse.json(
        { message: "YouTube task not found", taskId },
        { status: 404 }
      );
    }

    if (task.tester_no <= task.tester_ids.length) {
      task.task_flag = "Closed";
      await task.save({ session }); // Save within the session
      await session.commitTransaction(); // Commit transaction
      session.endSession(); // End session
      return NextResponse.json(
        { message: "Task is already full", taskId },
        { status: 400 }
      );
    }

    // Fetch tester within the session
    const testerExists = await Tester.findById(testerId).session(session);
    if (!testerExists) {
      await session.abortTransaction(); // Abort if tester not found
      return NextResponse.json(
        { message: "Tester not found", testerId },
        { status: 404 }
      );
    }

    if (task.tester_ids.includes(testerId)) {
      await session.abortTransaction(); // Abort if tester has already responded
      return NextResponse.json(
        { message: "Tester already responded to this task", testerId },
        { status: 400 }
      );
    }

    // Create new response within the session
    const youtubeResponse = new YoutubeResponse({
      taskId: new mongoose.Types.ObjectId(taskId),
      testerId: new mongoose.Types.ObjectId(testerId),
      response,
    });

    const result = await youtubeResponse.save({ session }); // Save response in session
    task.tester_ids.push(testerId);
    await task.save({ session }); // Save task updates within the session

    testerExists.taskHistory.push({
      taskId: taskId,
      status: "success",
    });
    await testerExists.save({ session }); // Save tester updates within the session

    if (task.tester_no === task.tester_ids.length) {
      task.task_flag = "Closed";
      await task.save({ session }); // Save task flag update within the session
    }

    // Credit wallet within the session
    const resultwallet = await creditWallet(testerId, 4, task._id,session);
    if (resultwallet.success === false) {
      return NextResponse.json(
        { message: resultwallet.message },
        { status: 500 }
      );
    }

    await session.commitTransaction(); // Commit the transaction if everything is successful
    session.endSession(); // End the session

    return NextResponse.json(
      { message: "Response added successfully", result },
      { status: 201 }
    );
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction in case of an error
    session.endSession(); // End the session
    console.error("Error:", error.message);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  } finally {
    if (session) session.endSession(); // Ensure the session ends, even in case of failure
  }
}
