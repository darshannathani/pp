import mongoose from "mongoose";

const appResponseSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppTask",
      required: true,
    },
    testerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tester",
      required: true,
    },
    responses: [
      {
        text: { type: String, required: true, trim: true },
        date: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AppResponse =
  mongoose.models.AppResponse ||
  mongoose.model("AppResponse", appResponseSchema);
export default AppResponse;
