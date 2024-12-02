import mongoose from "mongoose";
import { AppResponse, Task, Tester, AppTask } from "@/models";
import { NextResponse } from "next/server";
import { z } from "zod";

const addResponseSchema = z.object({
  testerId: z.string(),
  text: z.string(),
  taskId: z.string(),
});

export async function POST(req) {
  let session;
  let retries = 3;

  try {
    const parsedData = addResponseSchema.safeParse(await req.json());
    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { testerId, text, taskId } = parsedData.data;

    while (retries > 0) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();

        const [task, tester] = await Promise.all([
          Task.findById(taskId).session(session),
          Tester.findById(testerId).session(session),
        ]);

        if (!task) {
          await session.abortTransaction();
          return NextResponse.json(
            { message: "Task not found" },
            { status: 404 }
          );
        }

        if (!tester) {
          await session.abortTransaction();
          return NextResponse.json(
            { message: "Tester not found" },
            { status: 404 }
          );
        }

        const appTask = await AppTask.findById(task.specificTask).session(
          session
        );

        if (!appTask) {
          await session.abortTransaction();
          return NextResponse.json(
            { message: "App task not found" },
            { status: 404 }
          );
        }

        const isTesterSelected = appTask.selected_testers.some(
          (selected) => selected._id.toString() === testerId
        );

        if (!isTesterSelected) {
          await session.abortTransaction();
          return NextResponse.json(
            { message: "You are not selected for testing this app" },
            { status: 403 }
          );
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingResponse = await AppResponse.findOne({
          taskId,
          testerId,
          "responses.date": { $gte: today },
        }).session(session);

        if (existingResponse) {
          await session.abortTransaction();
          return NextResponse.json(
            { message: "A response for today has already been added" },
            { status: 409 }
          );
        }

        const newResponse = {
          text,
          date: new Date(),
        };

        const appResponse = await AppResponse.findOneAndUpdate(
          { taskId, testerId },
          { $push: { responses: newResponse } },
          { new: true, upsert: true, session }
        );

        await session.commitTransaction();

        return NextResponse.json(
          { message: "Response added successfully", result: appResponse },
          { status: 201 }
        );
      } catch (error) {
        if (session && session.inTransaction()) {
          await session.abortTransaction();
        }

        if (
          error.errorLabels &&
          error.errorLabels.includes("TransientTransactionError")
        ) {
          retries -= 1;
        } else {
          console.error("Error in transaction:", error);
          return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
          );
        }
      } finally {
        if (session) {
          await session.endSession();
        }
      }
    }

    return NextResponse.json(
      { message: "Failed after multiple retries" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
