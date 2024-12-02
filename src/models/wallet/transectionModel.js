import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference to a common User model (either Creator or Tester)
    },
    direction: {
      type: String,
      enum: ["credit", "debit"], // Credit means to the system, Debit means from the system
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Completed",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
export default Transaction;
