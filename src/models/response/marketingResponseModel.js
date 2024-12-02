import mongoose from "mongoose";

const marketingResponseSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketingTask",
      required: true,
    },
    testerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tester",
      required: true,
    },
    order: {
      orderId: { type: String, required: true, trim: true },
      orderDate: { type: Date, default: Date.now },
    },
    liveReview: {
      reviewLink: { type: String, required: true, trim: true },
      reviewImage: { type: String, required: true, trim: true },
      submittedAt: { type: Date, default: Date.now },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const MarketingResponse =
  mongoose.models.MarketingResponse ||
  mongoose.model("MarketingResponse", marketingResponseSchema);
export default MarketingResponse;
