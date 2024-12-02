import mongoose from "mongoose";

const marketingTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    product_details: { type: String, required: true, trim: true },
    product_link: { type: String, required: true, trim: true },
    product_price: { type: String, required: true, trim: true },
    refund_percentage: { type: Number, required: true, min: 0, max: 100 },
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

const MarketingTask =
  mongoose.models.MarketingTask ||
  mongoose.model("MarketingTask", marketingTaskSchema);
export default MarketingTask;
