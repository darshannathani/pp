import mongoose from "mongoose";
import {
  Tester,
  Task,
  AppTask,
  Creator,
  AppResponse,
  MarketingTask,
  SurveyTask,
  YoutubeTask,
  YoutubeResponse,
  SurveyResponse,
  MarketingResponse,
} from "@/models";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const reqBody = await req.json();

    // Validate request body
    if (!reqBody) {
      return NextResponse.json(
        { message: "Invalid request body", reqBody },
        { status: 400 }
      );
    }

    const { id, taskId } = reqBody;

    // Validate required fields
    if (!id || !taskId) {
      return NextResponse.json(
        { message: "Tester ID and Task ID are required", reqBody },
        { status: 400 }
      );
    }

    // Fetch the tester
    const tester = await Tester.findById(id);
    if (!tester) {
      return NextResponse.json(
        { message: "Tester not found", id },
        { status: 404 }
      );
    }

    // Fetch the task
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { message: "Task not found", taskId },
        { status: 404 }
      );
    }

    // Map task types to their respective models
    const taskTypeModelMap = {
      AppTask: AppTask,
      SurveyTask: SurveyTask,
      YoutubeTask: YoutubeTask,
      MarketingTask: MarketingTask,
    };

    // Get the specific task type model based on task type
    const taskTypeModel = taskTypeModelMap[task.type];
    
    if (!taskTypeModel) {
      return NextResponse.json(
        { message: `Invalid task type: ${task.taskType}` },
        { status: 400 }
      );
    }

    // Fetch the specific task instance
    const taskInstance = await taskTypeModel.findById(task.specificTask);
    if (!taskInstance) {
      return NextResponse.json(
        { message: "Specific task instance not found", taskId },
        { status: 404 }
      );
    }

    // Map task response types to their respective response models
    const taskResponseModelMap = {
      AppTask: AppResponse,
      SurveyTask: SurveyResponse,
      YoutubeTask: YoutubeResponse,
      MarketingTask: MarketingResponse, // Fixed the case
    };

    // Get the response model based on task type
    const taskResponseModel = taskResponseModelMap[task.type];
    if (!taskResponseModel) {
      return NextResponse.json(
        { message: `Invalid task response type: ${task.taskType}` },
        { status: 400 }
      );
    }

    // Check if a response from the tester already exists for the task
    const taskResponseInstance = await taskResponseModel.findOne({
      taskId: taskId, // Ensure the field names match your schema
      testerId: id, // Ensure the field names match your schema
    });
    
    // Check if the task has been checked today
    let alreadyChecked = false;
    if (taskResponseInstance) {
      const responseDates = taskResponseInstance.responses.map(
        (res) => res.date
      );
      responseDates.forEach((date) => {
        if (new Date(date).toDateString() === new Date().toDateString()) {
          alreadyChecked = true;
        }
      });
    }

    if (alreadyChecked) {
      return NextResponse.json(
        { message: "Task already checked today", taskId },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Task not yet checked today", taskId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
