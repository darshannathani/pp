import mongoose from "mongoose";

const youtubeResponseSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "YoutubeTask",
      required: true,
    },
    testerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tester",
      required: true,
    },
    response: { type: String, required: true, trim: true },
    submittedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const YoutubeResponse =
  mongoose.models.YoutubeResponse ||
  mongoose.model("YoutubeResponse", youtubeResponseSchema);
export default YoutubeResponse;
