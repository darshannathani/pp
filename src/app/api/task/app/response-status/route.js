import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Tester, Task, MarketingTask, AppTask } from "@/models";
import { creditWallet } from "@/_lib/walletService";

export async function POST(req) {
    const session = await mongoose.startSession();  // Start the session here
    session.startTransaction();  // Start the transaction
    
    try {
        const reqBody = await req.json();
        if (!reqBody) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { message: "Invalid request body", reqBody },
                { status: 400 }
            );
        }

        const { testerId, taskId, status } = reqBody;  
        console.log(reqBody);
        
        if (!testerId || !taskId || !status) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { message: "Tester ID and Task ID and Status are required", reqBody },
                { status: 400 }
            );
        }

        const tester = await Tester.findById(testerId).session(session);
        if (!tester) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { message: "Tester not found", testerId },
                { status: 404 }
            );
        }

        const taskExists = await Task.findById(taskId).session(session);
        if (!taskExists) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { message: "Task not found", taskId },
                { status: 404 }
            );
        }

        const specificTask = await AppTask.findById(taskExists.specificTask).session(session);
        if (!specificTask) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { message: "Specific Task not found", taskId },
                { status: 404 }
            );
        }

        if (status === "response-accepted") {
            await Tester.updateOne(
                { _id: testerId, "taskHistory.taskId": taskId },
                { $set: { "taskHistory.$.status": "success" } },
                { session }
            );
            creditWallet(testerId, 500 , taskExists._id , session)
        } else if (status === "response-rejected") {
            await Tester.updateOne(
                { _id: testerId, "taskHistory.taskId": taskId },
                { $set: { "taskHistory.$.status": "response-rejected" } },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json(
            { message: "Task response status updated successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
