import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Tester, Task, MarketingTask, Creator } from "@/models";

export async function POST(req) {
  const session = await mongoose.startSession(); // Start session for transaction
  session.startTransaction(); // Begin transaction

  try {
    const reqBody = await req.json();
    if (!reqBody) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { taskId, testerId, creatorId } = reqBody;

    // Validate required fields
    const missingField = !taskId
      ? "Task ID"
      : !creatorId
      ? "Creator ID"
      : !testerId
      ? "Tester ID"
      : null;
    if (missingField) {
      return NextResponse.json(
        { message: `${missingField} is required` },
        { status: 400 }
      );
    }

    const [tester, creator, task] = await Promise.all([
      Tester.findById(testerId).session(session),
      Creator.findById(creatorId).session(session),
      Task.findOne({ _id: taskId, type: "MarketingTask" }).session(session),
    ]);

    // Check existence of tester, creator, and task
    if (!tester) {
      return NextResponse.json(
        { message: "Tester not found" },
        { status: 404 }
      );
    }
    if (!creator) {
      return NextResponse.json(
        { message: "Creator not found" },
        { status: 404 }
      );
    }
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    if (task.creator.toString() !== creatorId) {
      return NextResponse.json(
        { message: "You are not the creator of this task" },
        { status: 403 }
      );
    }

    const specificTask = await MarketingTask.findById(
      task.specificTask
    ).session(session);
    if (!specificTask) {
      return NextResponse.json(
        { message: "Specific task not found" },
        { status: 404 }
      );
    }

    // Check if tester is already selected or rejected
    const isSelected = specificTask.selected_testers.some((tester) =>
      tester.equals(testerId)
    );
    const isRejected = specificTask.rejected_testers.some((tester) =>
      tester.equals(testerId)
    );
    const hasApplied = specificTask.applied_testers.some((tester) =>
      tester.equals(testerId)
    );

    if (isSelected) {
      return NextResponse.json(
        { message: "Tester is already selected" },
        { status: 400 }
      );
    }
    if (isRejected) {
      return NextResponse.json(
        { message: "Tester is already rejected" },
        { status: 400 }
      );
    }
    if (!hasApplied) {
      return NextResponse.json(
        { message: "Tester has not applied for this task" },
        { status: 400 }
      );
    }

    // Reject the tester
    specificTask.rejected_testers.push(testerId);
    specificTask.applied_testers.pull(testerId);
    await specificTask.save({ session }); // Save with session

    // Close the task if the number of selected testers reaches the limit
    if (specificTask.selected_testers.length === task.tester_no) {
      task.task_flag = "Closed"; // Corrected task flag update
      await task.save({ session }); // Save with session
    }

    // Update tester's task history
    await Tester.updateOne(
      { _id: testerId, "taskHistory.taskId": taskId },
      { $set: { "taskHistory.$.status": "rejected" } },
      { session }
    );

    await session.commitTransaction(); // Commit the transaction
    return NextResponse.json(
      { message: "Tester rejected successfully", task },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction(); // Rollback in case of any error
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  } finally {
    session.endSession(); // Ensure the session ends
  }
}
