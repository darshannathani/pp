import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Tester, Task, AppTask, Creator } from "@/models";

export async function POST(req) {
  const session = await mongoose.startSession(); // Start session for transaction
  session.startTransaction(); // Begin transaction

  try {
    const reqBody = await req.json();
    if (!reqBody) {
      await session.abortTransaction(); // Rollback if request body is invalid
      session.endSession();
      return NextResponse.json(
        { message: "Invalid request body", reqBody },
        { status: 400 }
      );
    }
    const { taskId, testerId , creatorId } = reqBody;

    if (!taskId) {
      await session.abortTransaction(); // Rollback if taskId is missing
      session.endSession();
      return NextResponse.json(
        { message: "Task ID is required", reqBody },
        { status: 400 }
      );
    }

    if (!creatorId) {
        await session.abortTransaction(); // Rollback if creatorId is missing
        session.endSession();
        return NextResponse.json(
            { message: "Creator ID is required", reqBody },
            { status: 400 }
        );
    }

    if (!testerId) {
      await session.abortTransaction(); // Rollback if testerId is missing
      session.endSession();
      return NextResponse.json(
        { message: "Tester ID is required", reqBody },
        { status: 400 }
      );
    }

    const tester = await Tester.findById(testerId).session(session); // Use session for the query
    if (!tester) {
      await session.abortTransaction(); // Rollback if tester not found
      session.endSession();
      return NextResponse.json(
        { message: "Tester ID is wrong", reqBody },
        { status: 400 }
      );
    }

    const creator = await Creator.findById(creatorId).session(session); // Use session for the query
    if (!creator) {
        await session.abortTransaction(); // Rollback if creator not found
        session.endSession();
        return NextResponse.json(
            { message: "Creator ID is wrong", reqBody },
            { status: 400 }
        );
    }

    const task = await Task.findOne({
      _id: taskId,
      type: "AppTask",
    }).session(session);

    if (!task) {
      await session.abortTransaction(); // Rollback if task not found
      session.endSession();
      return NextResponse.json(
        { message: "Task not found", taskId },
        { status: 404 }
      );
    }

    if(task.creator.toString() !== creatorId) {
        await session.abortTransaction(); // Rollback if creatorId is wrong
        session.endSession();
        return NextResponse.json(
            { message: "You are not creator of this task", reqBody },
            { status: 400 }
        );
    }

    const specificTask = await AppTask.findById(task.specificTask).session(session); // Use session for the query
    if (!specificTask) {
      await session.abortTransaction(); // Rollback if specific task not found
      session.endSession();
      return NextResponse.json(
        { message: "Specific task not found", taskId },
        { status: 404 }
      );
    }
    if (specificTask.selected_testers.some(tester => tester._id.equals(new mongoose.Types.ObjectId(testerId)))) {
      await session.abortTransaction(); // Rollback if tester is already selected
      session.endSession();
      return NextResponse.json(
        { message: "This user is already selected", task },
        { status: 400 }
      );
    }

    if(specificTask.rejected_testers.some(tester => tester._id.equals(new mongoose.Types.ObjectId(testerId)))) {
        await session.abortTransaction(); // Rollback if tester is already rejected
        session.endSession();
        return NextResponse.json(
          { message: "This user is already rejected", task },
          { status: 400 }
        )
    }
    if (!specificTask.applied_testers.some(tester => tester._id.equals(new mongoose.Types.ObjectId(testerId)))) {
      await session.abortTransaction(); // Rollback if tester has not applied
      session.endSession();
      return NextResponse.json(
        { message: "You have not applied for this task", task },
        { status: 400 }
      );
    }


    await specificTask.rejected_testers.push(testerId);
    await specificTask.applied_testers.pull(testerId);
    await specificTask.save({ session }); // Use session for the save operation

      if (specificTask.selected_testers.length === task.tester_no) {
        taskExists.task_flag = "Closed";
        await taskExists.save({ session }); // Use session for the save operation
      }


      await Tester.updateOne(
        { _id: testerId, "taskHistory.taskId": taskId },
        { $set: { "taskHistory.$.status": "rejected" } },
        { session }
      );

    await session.commitTransaction(); // Commit the transaction if successful
    session.endSession();

    return NextResponse.json(
      { message: "Tester rejected successfully", task },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction(); // Rollback in case of any error
    session.endSession();
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}
