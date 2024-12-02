  import mongoose from "mongoose";
  import { NextResponse } from "next/server";
  import { Tester, Task, MarketingTask } from "@/models";

  export async function POST(req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reqBody = await req.json();
      if (!reqBody) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "Invalid request body", reqBody },
          { status: 400 }
        );
      }

      const { testerId, taskId } = reqBody;

      if (!testerId || !taskId) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "Tester ID and Task ID are required", reqBody },
          { status: 400 }
        );
      }

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
        type: "MarketingTask",
      }).session(session);
      if (!taskExists) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "Task not found", taskId },
          { status: 404 }
        );
      }

      const specificTask = await MarketingTask.findById(
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

      // Ensure applied_testers is defined
      if (!Array.isArray(specificTask.applied_testers)) {
        specificTask.applied_testers = []; // Initialize if undefined
      }

      if (
        specificTask.applied_testers.some((tester) =>
          tester._id.equals(testerId)
        )
      ) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "You have already applied for this task", taskExists },
          { status: 400 }
        );
      }

      // Add tester to applied_testers
      specificTask.applied_testers.push(testerId);
      await specificTask.save({ session });
      if(!taskExists.tester_ids)
      {
        taskExists.tester_ids = [];
      }
      taskExists.tester_ids.push(testerId);
      await taskExists.save({ session });

      // Add task to tester's task history
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
