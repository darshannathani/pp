import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["AppTask", "MarketingTask", "SurveyTask", "YoutubeTask"],
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creator",
      required: true,
    },
    post_date: { type: Date, default: Date.now, required: true },
    end_date: { type: Date, required: true },
    tester_no: { type: Number, required: true, min: 1 },
    tester_age: { type: Number, required: true, min: 16 },
    tester_gender: {
      type: String,
      enum: ["Male", "Female", "Both"],
      required: true,
    },
    country: { type: String, required: true, trim: true },
    heading: { type: String, required: true, trim: true },
    instruction: { type: String, required: true, trim: true },
    task_flag: {
      type: String,
      enum: ["Open", "Closed", "Pending"],
      required: true,
    },
    tester_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tester" }],
    specificTask: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "type",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;
