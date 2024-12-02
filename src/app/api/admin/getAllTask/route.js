import { Task, AppTask, MarketingTask, YoutubeTask, SurveyTask } from "@/models";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const tasks = await Task.find({ task_flag: "Open" });
        let openTasks = [];

        for (const task of tasks) {
            const opentaskobj = {
                ...task._doc,
            }
            switch (task.type) {
                case "AppTask":
                    const apptask = await AppTask.findById(task.specificTask);
                    if (apptask) {
                        opentaskobj.specificTask = apptask._doc;
                        openTasks.push(opentaskobj);
                    };
                    break;
                case "MarketingTask":
                    const marketingtask = await MarketingTask.findById(task.specificTask);
                    if (marketingtask) {
                        opentaskobj.specificTask = marketingtask._doc;
                        openTasks.push(opentaskobj);
                    };
                    break;
                case "YoutubeTask":
                    const youtubetask = await YoutubeTask.findById(task.specificTask);
                    if (youtubetask) {
                        opentaskobj.specificTask = youtubetask._doc;
                        openTasks.push(opentaskobj);
                    }
                    break;
                case "SurveyTask":
                    const surveytask = await SurveyTask.findById(task.specificTask);
                    if (surveytask) {
                        opentaskobj.specificTask = surveytask._doc;
                        openTasks.push(opentaskobj);
                    };
                    break;
                default:
                    break;
            }
        }

        const ctasks = await Task.find({ task_flag: "Closed" });
        let closedTasks = [];

        for (const task of ctasks) {
            let closedTaskObj = {
                ...task._doc,
            }
            switch (task.type) {
                case "AppTask":
                    const apptask = await AppTask.findById(task.specificTask);
                    if (apptask) {
                        closedTaskObj.specificTask = apptask._doc;
                        closedTasks.push(closedTaskObj);
                    };
                    break;
                case "MarketingTask":
                    const marketingtask = await MarketingTask.findById(task.specificTask);
                    if (marketingtask) {
                        closedTaskObj.specificTask = marketingtask._doc;
                        closedTasks.push(closedTaskObj);
                    }
                    break;
                case "YoutubeTask":
                    const youtubetask = await YoutubeTask.findById(task.specificTask);
                    if (youtubetask) {
                        closedTaskObj.specificTask = youtubetask._doc;
                        closedTasks.push(closedTaskObj);
                    };
                    break;
                case "SurveyTask":
                    const surveytask = await SurveyTask.findById(task.specificTask);
                    if (surveytask) {
                        closedTaskObj.specificTask = surveytask._doc;
                        closedTasks.push(closedTaskObj);
                    };
                    break;
                default:
                    break;
            }
        }
        return NextResponse.json({ openTasks, closedTasks });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
