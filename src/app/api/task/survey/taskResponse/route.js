import mongoose from "mongoose";
import { Tester, Task, SurveyTask, SurveyResponse } from "@/models";
import { NextResponse } from "next/server";
import { z } from "zod";
import { creditWallet } from "@/_lib/walletService";

const surveyResponseSchema = z.object({
  taskId: z.string(),
  testerId: z.string(),
  response: z.array(
    z.object({
      questionId: z.number(),
      answer: z.string(),
    })
  ),
  status: z.enum(["accepted", "rejected"]),
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { taskId, testerId, response } = await req.json();

    const task = await Task.findById(taskId)
      .populate("specificTask")
      .session(session);
    if (!task || task.type !== "SurveyTask") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Survey task not found" },
        { status: 404 }
      );
    }

    if (task.tester_ids.length >= task.tester_no) {
      task.task_flag = "Closed";
      await task.save({ session });
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Task is already full" },
        { status: 400 }
      );
    }

    const tester = await Tester.findById(testerId).session(session);
    if (!tester) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Tester not found" },
        { status: 404 }
      );
    }

    const surveyResponse = new SurveyResponse({
      taskId: task._id,
      testerId: tester._id,
      responses: response,
    });

    const savedResponse = await surveyResponse.save({ session });

    if (!task.tester_ids.includes(testerId)) {
      task.tester_ids.push(testerId);
      await task.save({ session });
    }

    const existingTaskEntry = tester.taskHistory.find((entry) =>
      entry.taskId.equals(task._id)
    );

    if (existingTaskEntry) {
      existingTaskEntry.status = "success";
      existingTaskEntry.appliedAt = new Date();
    } else {
      tester.taskHistory.push({
        taskId: task._id,
        status: "success",
        appliedAt: new Date(),
      });
    }

    await tester.save({ session });

    if (task.tester_ids.length >= task.tester_no) {
      task.task_flag = "Closed";
      await task.save({ session });
    }

    const result = await creditWallet(testerId, response.length * 0.9, task._id,session);

    if (result.success === false) {
      session.endSession();
      return NextResponse.json(
        { message: result.message },
        { status: 500 }
      );
    }
    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        message: "Survey response saved successfully",
        response: savedResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error:", error.message);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}
