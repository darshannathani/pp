import { NextResponse } from "next/server";
import { Task, MarketingTask, Creator, Tester } from "@/models";
import mongoose from "mongoose";

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reqBody = await req.json();
    if (!reqBody) {
      return NextResponse.json(
        { message: "Body should not be empty" },
        { status: 400 }
      );
    }

    const { taskId, creatorId } = reqBody;

    if (!taskId || !creatorId) {
      return NextResponse.json(
        { message: "TaskId and CreatorId are required" },
        { status: 400 }
      );
    }

    const creator = await Creator.findById(creatorId).session(session);
    if (!creator) {
      return NextResponse.json(
        { message: "Creator not found" },
        { status: 404 }
      );
    }

    const task = await Task.findById(taskId).session(session);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    if (task.creator.toString() !== creatorId) {
      return NextResponse.json(
        { message: "Creator not authorized to view this task" },
        { status: 401 }
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

    // Fetch tester details concurrently
    const testerDetails = await Promise.all(
      specificTask.applied_testers.map(async (testerId) => {
        const tester = await Tester.findById(testerId).session(session);
        if (!tester) {
          return null; // Handle cases where tester is not found
        }

        const today = new Date();
        const tester_dob = new Date(tester.dob);
        const diffInMs = today - tester_dob;
        const tester_age = Math.floor(
          diffInMs / (1000 * 60 * 60 * 24 * 365.25)
        );
        return {
          name: `${tester.firstName} ${tester.lastName}`,
          email: tester.email,
          age: tester_age,
          testerId: tester._id,
        };
      })
    );

    // Filter out any null values (not found testers)
    const validTesterDetails = testerDetails.filter(
      (detail) => detail !== null
    );

    await session.commitTransaction();
    return NextResponse.json(
      { message: "Success", testerDetails: validTesterDetails },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
