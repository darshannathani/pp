import mongoose from "mongoose";

const surveyResponseSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SurveyTask",
      required: true,
    },
    testerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tester",
      required: true,
    },
    responses: [
      {
        questionId: { type: Number, required: true },
        answer: { type: String, required: true, trim: true },
        answeredAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SurveyResponse =
  mongoose.models.SurveyResponse ||
  mongoose.model("SurveyResponse", surveyResponseSchema);
export default SurveyResponse;
