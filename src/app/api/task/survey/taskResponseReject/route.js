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
        const { taskId, testerId } = await req.json();
        const tester = await Tester.findById(testerId).session(session);
        const task = await Task.findById(taskId).session(session);
        await Tester.updateOne(
            { _id: testerId, "taskHistory.taskId": taskId },
            { $set: { "taskHistory.$.status": "rejected" } },
            { session }
        );
        if (!task.tester_ids.includes(testerId)) {
            task.tester_ids.push(testerId);
            await task.save({ session });
          }

        await tester.save({ session });
        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(
            {
                message: "Survey response rejected successfully",
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
