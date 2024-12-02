import mongoose from "mongoose";
import { SurveyTask, Task, Creator } from "@/models";
import { NextResponse } from "next/server";
import { z } from "zod";

import { debitWallet } from "@/_lib/walletService";

const surveyTaskSchema = z.object({
  creator: z.string(),
  post_date: z.string(),
  end_date: z.string(),
  tester_no: z.number().min(1),
  tester_age: z.number().min(16),
  tester_gender: z.enum(["Male", "Female", "Both"]),
  country: z.string(),
  heading: z.string(),
  instruction: z.string(),
  noOfQuestions: z.number().min(1),
  questions: z.array(
    z.object({
      title: z.string(),
      answer_type: z.enum(["multiple-choice", "single-choice", "text"]),
      options: z.array(z.string()).optional(),
    })
  ),
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parsedData = surveyTaskSchema.safeParse(await req.json());
    if (!parsedData.success) {
      await session.abortTransaction();
      session.endSession();
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
      noOfQuestions,
      questions,
    } = parsedData.data;

    const creatorExists = await Creator.findById(creator).session(session);
    console.log(creator)
    if (!creatorExists) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Creator not found" },
        { status: 404 }
      );
    }

    if (noOfQuestions !== questions.length) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Number of questions does not match" },
        { status: 400 }
      );
    }

    const p_date = new Date(post_date);
    const e_date = new Date(end_date);
    const current_date = new Date();
    let task_flag = "Pending";

    if (current_date >= p_date && current_date <= e_date) {
      task_flag = "Open";
    } else if (current_date > e_date) {
      task_flag = "Closed";
    }

    const formattedQuestions = questions.map((q, index) => ({
      questionId: index + 1,
      title: q.title,
      answer_type:
        q.answer_type === "multiple-choice" ? "multiple_choice" : q.answer_type,
      options: q.options || [],
    }));

    const tempTask = new Task({
      type: "SurveyTask",
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

    const surveyTask = new SurveyTask({
      taskId: tempTask._id,
      noOfQuestions,
      questions: formattedQuestions,
    });

    const savedSurveyTask = await surveyTask.save({ session });

    tempTask.specificTask = savedSurveyTask._id;
    const savedTask = await tempTask.save({ session });

    creatorExists.taskHistory.push({
      task: savedTask._id,
    });
    await creatorExists.save({ session });

    const walletDebit = await debitWallet(creator, tester_no*noOfQuestions , tempTask._id , session);
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
      { message: "Survey task created successfully", task: savedTask },
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
