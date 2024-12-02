import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Tester, Task, AppTask } from "@/models";
import { z } from "zod";

const applyForTaskSchema = z.object({
  testerId: z.string(),
  taskId: z.string(),
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parsedData = applyForTaskSchema.safeParse(await req.json());
    if (!parsedData.success) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { testerId, taskId } = parsedData.data;

    const tester = await Tester.findById(testerId).session(session);
    if (!tester) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Tester not found", testerId },
        { status: 404 }
      );
    }

    const taskExists = await Task.findOne({
      _id: taskId,
      type: "AppTask",
    }).session(session);
    if (!taskExists) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Task not found", taskId },
        { status: 404 }
      );
    }

    const specificTask = await AppTask.findById(
      taskExists.specificTask
    ).session(session);
    if (!specificTask) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Specific task not found", taskId },
        { status: 404 }
      );
    }

    if (specificTask.applied_testers.includes(testerId)) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "You have already applied for this task", taskExists },
        { status: 400 }
      );
    }

    specificTask.applied_testers.push(testerId);
    await specificTask.save({ session });
    
    if(!taskExists.tester_ids)
    {
      taskExists.tester_ids = [];
    }
    taskExists.tester_ids.push(testerId);
    await taskExists.save({ session });

    if (!taskExists.tester_ids) {
      taskExists.tester_ids = [];
    }
    taskExists.tester_ids.push(testerId);
    await taskExists.save({ session });

    tester.taskHistory.push({
      taskId: taskId,
      status: "applied",
    });

    await tester.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { message: "Task applied successfully", task: taskExists },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}