import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Task, AppTask, Creator, Tester } from "@/models";
import { z } from "zod";

const getAppliedTestersSchema = z.object({
  taskId: z.string(),
  creatorId: z.string(),
  page: z.number().positive().default(1),
  limit: z.number().positive().default(10),
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parsedData = getAppliedTestersSchema.safeParse(await req.json());
    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { taskId, creatorId, page, limit } = parsedData.data;
    const creator = await Creator.findById(creatorId).session(session);
    if (!creator) {
      return NextResponse.json(
        { message: "Creator not found", creatorId },
        { status: 404 }
      );
    }

    const task = await Task.findById(taskId).session(session);
    if (!task) {
      return NextResponse.json(
        { message: "Task not found", taskId },
        { status: 404 }
      );
    }

    if (task.creator.toString() !== creatorId) {
      return NextResponse.json(
        { message: "Creator not authorized to view this task" },
        { status: 401 }
      );
    }

    const specificTask = await AppTask.findById(task.specificTask)
      .session(session)
      .populate({
        path: "applied_testers",
        options: {
          skip: (page - 1) * limit,
          limit: limit,
        },
      });

    if (!specificTask) {
      return NextResponse.json(
        { message: "Specific task not found", taskId },
        { status: 404 }
      );
    }

    const appliedTesters = await Tester.find({
      _id: { $in: specificTask.applied_testers },
    }).session(session);

    const testerDetails = appliedTesters.map((tester) => ({
      name: `${tester.firstName} ${tester.lastName}`,
      email: tester.email,
      age: calculateAge(tester.dob),
      testerId: tester._id,
    }));

    const totalTesters = await AppTask.aggregate([
      { $match: { _id: specificTask._id } },
      { $project: { appliedTestersCount: { $size: "$applied_testers" } } },
    ]).session(session);

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        message: "Success",
        testerDetails,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTesters[0].appliedTestersCount / limit),
          totalTesters: totalTesters[0].appliedTestersCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      { message: "Error in request", error: error.message },
      { status: 500 }
    );
  }
}

function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    return age - 1;
  }
  return age;
}
