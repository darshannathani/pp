import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Tester, Task, AppTask, Creator } from "@/models";
import { z } from "zod";

const selectTesterSchema = z.object({
  taskId: z.string(),
  testerId: z.string(),
  creatorId: z.string(),
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parsedData = selectTesterSchema.safeParse(await req.json());
    if (!parsedData.success) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { taskId, testerId, creatorId } = parsedData.data;

    const tester = await Tester.findById(testerId).session(session);
    if (!tester) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Tester ID is wrong", reqBody },
        { status: 400 }
      );
    }

    const creator = await Creator.findById(creatorId).session(session);
    if (!creator) {
      await session.abortTransaction();
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
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Task not found", taskId },
        { status: 404 }
      );
    }
    if (task.creator.toString() !== creatorId) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "You are not the creator of this task", reqBody },
        { status: 400 }
      );
    }

    const specificTask = await AppTask.findById(task.specificTask).session(
      session
    );
    if (!specificTask) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Specific task not found", taskId },
        { status: 404 }
      );
    }

    if (
      specificTask.selected_testers.some((selectedTester) =>
        selectedTester._id.equals(new mongoose.Types.ObjectId(testerId))
      )
    ) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "This user is already selected", task },
        { status: 400 }
      );
    }

    if (
      specificTask.rejected_testers.some((rejectedTester) =>
        rejectedTester._id.equals(new mongoose.Types.ObjectId(testerId))
      )
    ) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "This user is already rejected", task },
        { status: 400 }
      );
    }

    if (
      !specificTask.applied_testers.some((appliedTester) =>
        appliedTester._id.equals(new mongoose.Types.ObjectId(testerId))
      )
    ) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "You have not applied for this task", task },
        { status: 400 }
      );
    }

    await specificTask.selected_testers.push(testerId);
    await specificTask.applied_testers.pull(testerId);
    await specificTask.save({ session });

    if (specificTask.selected_testers.length === task.tester_no) {
      task.task_flag = "Closed";
      await task.save({ session });
    }

    await Tester.updateOne(
      { _id: testerId, "taskHistory.taskId": taskId },
      { $set: { "taskHistory.$.status": "pending" } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      { message: "Tester selected successfully", task },
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
