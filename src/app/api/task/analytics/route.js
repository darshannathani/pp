import mongoose from "mongoose";
import {
  Task,
  SurveyTask,
  YoutubeTask,
  AppTask,
  MarketingTask,
  SurveyResponse,
  YoutubeResponse,
  AppResponse,
  MarketingResponse,
  Tester,
} from "@/models";
import { NextResponse } from "next/server";
import { z } from "zod";

const analyticsSchema = z.object({
  id: z.string(),
  type: z.enum(["SurveyTask", "YoutubeTask", "AppTask", "MarketingTask"]),
});

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const parsedData = analyticsSchema.safeParse(await req.json());

    if (!parsedData.success) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { id, type } = parsedData.data;

    const task = await Task.findById(id)
      .populate("specificTask")
      .session(session);

    console.log(task)

    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    let responseModel, formattedResults;

    switch (type) {
      case "SurveyTask":
        responseModel = SurveyResponse;
        formattedResults = await processSurveyAnalytics(
          task,
          responseModel,
          session
        );
        break;
      case "YoutubeTask":
        responseModel = YoutubeResponse;
        formattedResults = await processYoutubeAnalytics(
          task,
          responseModel,
          session
        );
        break;
      case "AppTask":
        responseModel = AppResponse;
        formattedResults = await processAppAnalytics(
          task,
          responseModel,
          session,
          Tester
        );
        break;
      case "MarketingTask":
        responseModel = MarketingResponse;
        formattedResults = await processMarketingAnalytics(
          task,
          responseModel,
          session
        );
        break;
      default:
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "Invalid task type" },
          { status: 400 }
        );
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      {
        message: "Analytics",
        task: {
          id: task._id,
          type: type,
          heading: task.heading,
          instruction: task.instruction,
          answers: formattedResults,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

async function processSurveyAnalytics(task, responseModel, session) {
  const taskResponses = await responseModel
    .find({ taskId: task._id })
    .session(session);
  const results = {};

  task.specificTask.questions.forEach((question) => {
    results[question.questionId] = {};
    if (question.answer_type === "multiple_choice") {
      question.options.forEach((option) => {
        results[question.questionId][option] = 0;
      });
    }
  });

  taskResponses.forEach((response) => {
    response.responses.forEach(({ questionId, answer }) => {
      if (results[questionId]) {
        if (typeof results[questionId][answer] === "number") {
          results[questionId][answer]++;
        } else {
          results[questionId][answer] = 1;
        }
      }
    });
  });

  return task.specificTask.questions.map(
    ({ questionId, title, answer_type, options }) => ({
      question: title,
      answerType: answer_type,
      answers:
        answer_type === "multiple_choice"
          ? options.map((option) => ({
            option,
            count: results[questionId][option] || 0,
          }))
          : Object.entries(results[questionId]).map(([answer, count]) => ({
            answer,
            count,
          })),
    })
  );
}

async function processYoutubeAnalytics(task, responseModel, session) {
  const taskResponses = await responseModel
    .find({ taskId: task._id })
    .session(session);
  const results = {};
  const options = task.specificTask.youtube_thumbnails.map(
    (thumbnail) => thumbnail.title
  );

  options.forEach((option) => {
    results[option] = 0;
  });

  taskResponses.forEach((response) => {
    if (response.response && options.includes(response.response)) {
      results[response.response]++;
    }
  });

  return {
    question: task.heading,
    answers: options.map((option) => ({
      option,
      count: results[option],
    })),
  };
}

async function processAppAnalytics(task, responseModel, session, testerModel) {
  const taskResponses = await responseModel
    .find({ taskId: task._id })
    .session(session)
    .populate({
      path: "testerId",
      model: testerModel,
      select: "firstName lastName email",
    });

  const detailedResponses = taskResponses.flatMap((response) =>
    response.responses.map((r) => ({
      testerId: response.testerId._id, // Include the testerId
      testerName: `${response.testerId.firstName} ${response.testerId.lastName}`,
      email: response.testerId.email,
      text: r.text,
      date: r.date,
    }))
  );

  return {
    totalResponses: taskResponses.length,
    detailedResponses,
  };
}

async function processMarketingAnalytics(task, responseModel, session) {
  const taskResponses = await responseModel
    .find({ taskId: task._id })
    .populate('testerId', 'firstName lastName') // Populate tester information
    .session(session);

  const orderDates = taskResponses.map((response) => response.order.orderDate);
  const reviewSubmissionDates = taskResponses.map(
    (response) => response.liveReview.submittedAt
  );

  const totalOrders = taskResponses.length;
  const averageTimeBetweenOrderAndReview = calculateAverageTimeDifference(
    orderDates,
    reviewSubmissionDates
  );

  const detailedResponses = taskResponses.map((response) => ({
    orderId: response.order.orderId,
    orderDate: response.order.orderDate,
    reviewLink: response.liveReview.reviewLink,
    reviewImage: response.liveReview.reviewImage,
    submittedAt: response.liveReview.submittedAt,
    testerName: `${response.testerId.firstName} ${response.testerId.lastName}`,
    testerId: response.testerId._id, // Include the testerId
  }));

  return {
    taskId: task._id,
    totalOrders,
    averageTimeBetweenOrderAndReview,
    detailedResponses,
  };
}

function calculateAverageTimeDifference(dates1, dates2) {
  const timeDifferences = dates1.map((date, index) =>
    Math.abs(new Date(date) - new Date(dates2[index]))
  );
  const totalTime = timeDifferences.reduce((sum, diff) => sum + diff, 0);
  const averageTime = totalTime / timeDifferences.length;
  const averageHours = Math.floor(averageTime / (1000 * 60 * 60));
  const averageMinutes = Math.floor((averageTime % (1000 * 60 * 60)) / (1000 * 60));
  return `${averageHours} hours ${averageMinutes} minutes`;
}

