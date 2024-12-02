import mongoose from "mongoose";
import { Creator, Task, MarketingTask } from "@/models";
import { NextResponse } from "next/server";
import { debitWallet } from "@/_lib/walletService";

export async function POST(req) {
  let session;
  
  try {
    const reqBody = await req.json();
    if (!reqBody) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const {
      creator,
      post_date,
      end_date,
      tester_no,
      tester_age,
      tester_gender,
      country,
      heading,
      instruction,
      product_details,
      product_link,
      product_price,
      refund_percentage,
    } = reqBody;

    if (
      !creator ||
      !post_date ||
      !end_date ||
      !tester_no ||
      !tester_age ||
      !tester_gender ||
      !country ||
      !heading ||
      !instruction ||
      !product_details ||
      !product_link ||
      !product_price ||
      !refund_percentage
    ) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const creatorExists = await Creator.findById(creator);
    if (!creatorExists) {
      return NextResponse.json({ message: "Creator not found" }, { status: 404 });
    }

    const p_date = new Date(post_date);
    const e_date = new Date(end_date);
    const current_date = new Date();

    const task_flag = current_date > e_date ? "Closed" : current_date >= p_date ? "Open" : "Pending";

    session = await mongoose.startSession();
    session.startTransaction();

    // Create the task and specific MarketingTask
    const task = new Task({
      type: "MarketingTask",
      creator: new mongoose.Types.ObjectId(creator),
      post_date: p_date,
      end_date: e_date,
      tester_no,
      tester_age,
      tester_gender,
      country,
      heading,
      instruction,
      task_flag,
    });

    const marketingTask = new MarketingTask({
      taskId: task._id,
      product_details,
      product_link,
      product_price,
      refund_percentage,
      applied_testers: [],
      selected_testers: [],
      rejected_testers: [],
    });

    // Link the marketingTask to the task
    task.specificTask = marketingTask._id;

    // Save operations within the transaction
    await marketingTask.save({ session });
    await task.save({ session });
    await Creator.findByIdAndUpdate(
      creator,
      { $push: { taskHistory: { task: task._id } } },
      { session, new: true }
    );

    const walletDebit = await debitWallet(creator, ((marketingTask.refund_percentage/100) *(task.tester_no)*marketingTask.product_price) + ((5/100)*marketingTask.product_price*task.tester_no) , task._id , session);
    if (!walletDebit.success) {
      return NextResponse.json(
        {
          message: "Survey task created successfully but dont have enough money in wallet",
          task: savedTask,
        },
        { status: 402 }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return NextResponse.json(
      { message: "Marketing task added successfully", task },
      { status: 200 }
    );
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
