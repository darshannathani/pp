import mongoose from "mongoose";

const appTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    applied_testers: [
      {
        testerId: { type: mongoose.Schema.Types.ObjectId, ref: "Tester" },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    selected_testers: [
      {
        testerId: { type: mongoose.Schema.Types.ObjectId, ref: "Tester" },
        selectedAt: { type: Date, default: Date.now },
      },
    ],
    rejected_testers: [
      {
        testerId: { type: mongoose.Schema.Types.ObjectId, ref: "Tester" },
        rejectedAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AppTask =
  mongoose.models.AppTask || mongoose.model("AppTask", appTaskSchema);
export default AppTask;
