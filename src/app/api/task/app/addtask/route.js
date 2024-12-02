import mongoose from "mongoose";
import { Creator, Task, AppTask } from "@/models";
import { NextResponse } from "next/server";
import { z } from "zod";
import { debitWallet } from "@/_lib/walletService";

// Define the schema for creating an App Task
const createAppTaskSchema = z.object({
  creator: z.string(),
  post_date: z.string().transform((val) => new Date(val)),
  end_date: z.string().transform((val) => new Date(val)),
  tester_no: z.number().positive(),
  tester_age: z.number().positive(),
  tester_gender: z.enum(["Male", "Female", "Both"]),
  country: z.string().min(2),
  heading: z.string().min(1),
  instruction: z.string().min(1),
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Parse and validate the request data
    const parsedData = createAppTaskSchema.safeParse(await req.json());
    if (!parsedData.success) {
      throw new Error(parsedData.error.message);
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
    } = parsedData.data;

    // Check if the creator exists
    const creatorExists = await Creator.findById(creator).session(session);
    if (!creatorExists) {
      throw new Error("Creator not found");
    }

    // Determine the task flag based on current date
    const current_date = new Date();
    const task_flag =
      current_date >= post_date && current_date <= end_date
        ? "Open"
        : current_date > end_date
        ? "Closed"
        : "Pending";

    // Create the Task instance first
    const task = new Task({
      type: "AppTask",
      creator,
      post_date,
      end_date,
      tester_no,
      tester_age,
      tester_gender,
      country,
      heading,
      instruction,
      task_flag,
    });

    

    // Create the AppTask instance and set taskId
    const appTask = new AppTask({
      taskId: task._id, // Set taskId here
      applied_testers: [],
      selected_testers: [],
      rejected_testers: [],
    });

    // Save the AppTask
    const savedAppTask = await appTask.save({ session });

    task.specificTask = savedAppTask._id;

    // Save the Task instance
    const savedTask = await task.save({ session });



    

    // Update the creator's task history
    await Creator.findByIdAndUpdate(
      creator,
      { $push: { taskHistory: { task: savedTask._id } } },
      { session, new: true }
    );
    const walletDebit = await debitWallet(creator, tester_no*500 , task._id , session);
    if (!walletDebit.success) {
      return NextResponse.json(
        {
          message: "Survey task created successfully but dont have enough money in wallet",
          task: savedTask,
        },
        { status: 402 }
      );
    }
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    

    return NextResponse.json(
      {
        message: "Task added successfully",
        task: savedTask,
        appTask: savedAppTask,
      },
      { status: 200 }
    );
  } catch (error) {
    // Roll back the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "An error occurred", error: error.message },
      { status: 500 }
    );
  }
}