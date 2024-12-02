import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Task, AppTask, MarketingTask, Tester } from "@/models";
import { z } from "zod";

const getTestersSchema = z.object({
    taskId: z.string(),
    taskType: z.enum(["AppTask", "MarketingTask"]),
});

export async function POST(req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const parsedData = getTestersSchema.safeParse(await req.json());
        if (!parsedData.success) {
            return NextResponse.json(
                { message: "Invalid request parameters", errors: parsedData.error.issues },
                { status: 400 }
            );
        }
        const { taskId, taskType } = parsedData.data;

        const task = await Task.findById(taskId).session(session);
        if (!task) {
            return NextResponse.json(
                { message: "Task not found", taskId },
                { status: 404 }
            );
        }

        let specificTask;
        if (taskType === "AppTask") {
            specificTask = await AppTask.findById(task.specificTask)
                .session(session)
                .populate('selected_testers.testerId rejected_testers.testerId');
        } else if (taskType === "MarketingTask") {
            specificTask = await MarketingTask.findById(task.specificTask)
                .session(session)
                .populate('selected_testers.testerId rejected_testers.testerId');
        }

        if (!specificTask) {
            return NextResponse.json(
                { message: "Specific task not found", taskId },
                { status: 404 }
            );
        }
        const selected_list = specificTask.selected_testers.map((id) => id._id)
        const testers = await Tester.find({ _id: { $in: selected_list } });
        const selectedTesters = testers.map(tester => ({
            name: `${tester.firstName} ${tester.lastName}`,
            email: tester.email,
            age: calculateAge(tester.dob),
            testerId: tester._id,
        }));

        const rejected_testers = specificTask.rejected_testers.map((id) => id._id)

        const rejected = await Tester.find({ _id: { $in: rejected_testers } })

        const rejectedTesters = rejected.map(tester => ({
            name: `${tester.firstName} ${tester.lastName}`,
            email: tester.email,
            age: calculateAge(tester.dob),
            testerId: tester._id,
        }));

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(
            {
                message: "Success",
                taskType,
                selectedTesters,
                rejectedTesters
            },
            { status: 200 }
        );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error)
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