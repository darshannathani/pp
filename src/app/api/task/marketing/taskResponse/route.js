import mongoose from "mongoose";
import { MarketingResponse, Task, Tester } from "@/models"; // Updated to import MarketingResponse
import { NextResponse } from "next/server";

export async function POST(req) {
  let session;

  try {
    session = await mongoose.startSession(); // Start session for transaction
    session.startTransaction();

    // Destructure the request body
    const { testerId, orderId, orderDate, liveReview } = await req.json();

    // Validate required fields
    if (
      !testerId ||
      !orderId ||
      !liveReview ||
      !liveReview.reviewLink ||
      !liveReview.reviewImage
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const taskId = liveReview.taskId; // Extracting taskId from liveReview
    const task = await Task.findById(taskId)
      .populate("specificTask")
      .session(session);
    const tester = await Tester.findById(testerId).session(session);

    // Check if task or tester is invalid
    if (
      !task ||
      !tester ||
      task.type !== "MarketingTask" ||
      !task.specificTask
    ) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: "Invalid Task or Tester" },
        { status: 404 }
      );
    }

    const marketingTask = task.specificTask;

    // Check if tester is selected for the task
    if (
      !marketingTask.selected_testers.some((selected) =>
        selected._id.equals(testerId)
      )
    ) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: "You are not selected for this task" },
        { status: 403 }
      );
    }

    // Check if a response for today already exists
    const existingResponse = await MarketingResponse.findOne({
      taskId,
      testerId,
    }).session(session);
    if (existingResponse) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: "A response for today has already been added" },
        { status: 409 }
      );
    }

    // Create a new marketing response
    const newResponse = {
      order: {
        orderId,
        orderDate: new Date(orderDate), // Convert orderDate to Date
      },
      liveReview: {
        reviewLink: liveReview.reviewLink,
        reviewImage: liveReview.reviewImage,
        submittedAt: new Date(), // Set submittedAt to the current date
      },
    };

    const marketingResponse = await MarketingResponse.create(
      [{ taskId, testerId, ...newResponse }],
      { session }
    );

    
    await Tester.updateOne(
      { _id: testerId, "taskHistory.taskId": taskId },
      { $set: { "taskHistory.$.status": "inreview" } },
      { session }
    );
    


    await session.commitTransaction();

    return NextResponse.json(
      { message: "Response added successfully", result: marketingResponse },
      { status: 201 }
    );
  } catch (error) {
    if (session?.inTransaction()) await session.abortTransaction(); // Rollback if in transaction
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message }, // Include error message
      { status: 500 }
    );
  } finally {
    if (session) await session.endSession(); // Ensure the session ends
  }
}
