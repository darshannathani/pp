import mongoose from "mongoose";

const surveyTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    noOfQuestions: { type: Number, required: true, min: 1 },
    questions: [
      {
        questionId: { type: Number, required: true },
        title: { type: String, required: true, trim: true },
        answer_type: {
          type: String,
          required: true,
          enum: ["text", "multiple_choice", "rating"],
        },
        options: [{ type: String, trim: true }],
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SurveyTask =
  mongoose.models.SurveyTask || mongoose.model("SurveyTask", surveyTaskSchema);
export default SurveyTask;
