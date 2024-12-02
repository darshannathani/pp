import mongoose from "mongoose";
import {
  Tester,
  Task,
  AppTask,
  MarketingTask,
  SurveyTask,
  YoutubeTask,
} from "@/models";
import { NextResponse } from "next/server";
import { z } from "zod";

const listTasksSchema = z.object({
  testerId: z.string(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).default(10),
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parsedData = listTasksSchema.safeParse(await req.json());
    if (!parsedData.success) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { testerId, page, limit } = parsedData.data;

    const tester = await Tester.findById(testerId).session(session);
    if (!tester) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Tester not found" },
        { status: 404 }
      );
    }

    const today = new Date();
    const tester_age = Math.floor(
      (today - new Date(tester.dob)) / (1000 * 60 * 60 * 24 * 365.25)
    );

    const baseQuery = {
      task_flag: "Open",
      tester_age: { $lte: tester_age },
      post_date: { $lte: today },
      end_date: { $gte: today },
      country: tester.country,
      $or: [{ tester_gender: "Both" }, { tester_gender: tester.gender }],
      tester_ids: { $nin: [testerId] },
    };
    const tasks = await Task.find(baseQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .session(session);

    if (!tasks || tasks.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "No tasks available" },
        { status: 404 }
      );
    }
    const filteredTasks = await Promise.all(
      tasks.map(async (task) => {
        let specificTaskDetails;
        switch (task.type) {
          case "AppTask":
            specificTaskDetails = await AppTask.findById(
              task.specificTask
            ).session(session);
            break;
          case "MarketingTask":
            specificTaskDetails = await MarketingTask.findById(
              task.specificTask
            ).session(session);
            break;
          case "SurveyTask":
            specificTaskDetails = await SurveyTask.findById(
              task.specificTask
            ).session(session);
            break;
          case "YoutubeTask":
            specificTaskDetails = await YoutubeTask.findById(
              task.specificTask
            ).session(session);
            break;
        }

        const availableSlots = task.tester_no - task.tester_ids.length;

        return {
          ...task.toObject(),
          specificTaskDetails,
          availableSlots,
        };
      })
    );

    const totalTasks = await Task.countDocuments(baseQuery).session(session);

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        message: "Available Tasks",
        tasks: filteredTasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTasks / limit),
          totalTasks,
        },
      },
      { status: 200 }
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
