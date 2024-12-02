import mongoose from "mongoose";

const youtubeTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    youtube_thumbnails: [
      {
        title: { type: String, required: true, trim: true },
        link: { type: String, trim: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    web_link: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const YoutubeTask =
  mongoose.models.YoutubeTask ||
  mongoose.model("YoutubeTask", youtubeTaskSchema);
export default YoutubeTask;
