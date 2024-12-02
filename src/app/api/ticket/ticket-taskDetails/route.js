import mongoose from "mongoose";
import { NextResponse } from "next/server";
import {Task, Ticket, Tester, AppResponse, AppTask, SurveyTask, SurveyResponse, MarketingTask, MarketingResponse, YoutubeResponse, YoutubeTask} from "@/models"

export async function POST(req) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { ticketId } = await req.json();
        const ticket = await Ticket.findOne({ ticketId }).session(session);
        const task = await Task.findById(ticket.taskId).session(session);
        const taskType = task.type;
        console.log("Task Type: ", taskType);
        let specificTask = ""

        switch(taskType){
            case "AppTask":
                specificTask = await AppTask.findById(task.specificTask).session(session);
                break;
            case "SurveyTask":
                specificTask = await SurveyTask.findById(task.specificTask).session(session);
                break;
            case "MarketingTask":
                specificTask = await MarketingTask.findById(task.specificTask).session(session);
                break;
            case "YoutubeTask":
                specificTask = await YoutubeTask.findById(task.specificTask).session(session);
                break;
        }
        console.log("task",task.id)
        console.log("Specific Task: ", specificTask);
        let response = ""

        switch(taskType){
            case "AppTask":
                response = await AppResponse.find({
                    taskId: task.id,
                    testerId: ticket.testerId,
                }).session(session);
                break;
            case "SurveyTask":
                response = await SurveyResponse.find({
                    taskId: task.id,
                    testerId: ticket.testerId,
                }).session(session);
                break;
            case "MarketingTask":
                response = await MarketingResponse.find({
                    taskId: task.id,
                    testerId: ticket.testerId,
                }).session(session);
                break;
            case "YoutubeTask":
                response = await YoutubeResponse.find({
                    taskId: task.id,
                    testerId: ticket.testerId,
                }).session(session);
                break;
        }

        
        console.log("Response: ", response);
        return NextResponse.json({ message: "Task details retrieved", task: task,specificTask:specificTask, response: response }, { status: 200 });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in POST request:", error);
        return NextResponse.json(
            { message: "An error occurred", error: error.message },
            { status: 500 }
        );
    }
}
