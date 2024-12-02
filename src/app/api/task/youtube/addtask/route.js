import mongoose from "mongoose";
import { Creator, Task, YoutubeTask } from "@/models";
import { NextResponse } from "next/server";
import { z } from "zod";
import { debitWallet } from "@/_lib/walletService";

const youtubeTaskSchema = z.object({
  creator: z.string(),
  post_date: z.string().transform((val) => new Date(val)),
  end_date: z.string().transform((val) => new Date(val)),
  tester_no: z.number().min(1),
  tester_age: z.number().min(1),
  tester_gender: z.enum(["Male", "Female", "Both"]),
  country: z.string(),
  heading: z.string(),
  instruction: z.string(),
  youtube_thumbnails: z.array(
    z.object({
      title: z.string(),
    })
  ),
  web_link: z.string(),
});

export async function POST(req) {
  const MAX_RETRIES = 3; // Set max retries for write conflicts

  let session; // Declare session outside the loop

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      session = await mongoose.startSession(); // Start the session
      session.startTransaction(); // Start a transaction

      const parsedData = youtubeTaskSchema.safeParse(await req.json());
      if (!parsedData.success) {
        await session.abortTransaction(); // Abort on validation failure
        return NextResponse.json(
          { message: "Invalid request body", errors: parsedData.error.issues },
          { status: 400 }
        );
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
        youtube_thumbnails,
        web_link,
      } = parsedData.data;

      const creatorExists = await Creator.findById(creator).session(session);
      if (!creatorExists) {
        await session.abortTransaction();
        return NextResponse.json(
          { message: "Creator not found" },
          { status: 404 }
        );
      }

      const current_date = new Date();
      let task_flag = "Pending";
      if (current_date >= post_date && current_date <= end_date) {
        task_flag = "Open";
      } else if (current_date > end_date) {
        task_flag = "Closed";
      }

      const task = new Task({
        type: "YoutubeTask",
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

      const youtubeTask = new YoutubeTask({
        taskId: task._id,
        youtube_thumbnails,
        web_link,
      });

      task.specificTask = youtubeTask._id;

      await task.save({ session });
      await youtubeTask.save({ session });

      creatorExists.taskHistory.push({
        task: task._id,
        createdAt: new Date(),
      });
      await creatorExists.save({ session });

      const walletDebit = await debitWallet(creator, tester_no * 5, task._id, session);
      console.log("walletDebit", walletDebit);
      if (!walletDebit.success) {

        return NextResponse.json(
          {
            message:
              "YouTube task created successfully but don't have enough money in wallet",
            task: task,
          },
          { status: 402 }
        );
      }

      await session.commitTransaction(); // Commit the transaction
      return NextResponse.json(
        {
          message: "YouTube task created successfully",
          task: task,
          youtubeTask: youtubeTask,
        },
        { status: 201 }
      );
    } catch (error) {
      if (session) await session.abortTransaction(); // Ensure the transaction is aborted on failure
      console.error("Attempt", attempt + 1, "Error:", error.message);

      // Retry if it's a write conflict
      if (
        attempt < MAX_RETRIES - 1 &&
        error.message.includes("Write conflict")
      ) {
        console.log("Retrying transaction...");
        continue; // Retry the transaction
      }

      return NextResponse.json(
        { message: "An error occurred", error: error.message },
        { status: 500 }
      );
    } finally {
      if (session) session.endSession(); // Always ensure session is ended
    }
  }
}
