import mongoose from "mongoose";
import { Tester, Task, Creator } from "@/models";
import { NextResponse } from "next/server";
import { z } from "zod";

const getTasksSchema = z.object({
  id: z.string(),
  role: z.enum(["tester", "creator"]),
});

export async function POST(req) {
  try {
    const parsedData = getTasksSchema.safeParse(await req.json());
    if (!parsedData.success) {
      return NextResponse.json(
        { message: "Invalid request body", errors: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { id, role } = parsedData.data;

    if (role === "tester") {
      const tester = await Tester.findById(id);
      if (!tester) {
        return NextResponse.json(
          { message: "Tester not found", id },
          { status: 404 }
        );
      }

      const appliedTasks = await Task.find({
        _id: {
          $in: tester.taskHistory
            .filter((task) => task.status === "pending")
            .map((task) => task.taskId),
        },
      });

      if (appliedTasks.length === 0) {
        return NextResponse.json(
          { message: "No applied tasks found", id },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Success", tasks: appliedTasks },
        { status: 200 }
      );
    } else if (role === "creator") {
      const creator = await Creator.findById(id);
      if (!creator) {
        return NextResponse.json(
          { message: "Creator not found", id },
          { status: 404 }
        );
      }

      const openTasks = await Task.find({
        task_flag: "Open",
        _id: { $in: creator.taskHistory.map((task) => task.task) },
      });

      if (openTasks.length === 0) {
        return NextResponse.json(
          { message: "No open tasks found", id },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Success", tasks: openTasks },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Invalid role", role },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
