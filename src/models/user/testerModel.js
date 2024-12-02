import mongoose from "mongoose";

const testerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobileNo: { type: String, required: true, unique: true, trim: true },
    pincode: { type: Number, required: true },
    country: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      required: true,
    },
    dob: { type: Date, required: true },
    google_auth_url: { type: String, trim: true },
    taskHistory: [
      {
        taskId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Task",
          required: true,
        },
        status: {
          type: String,
          enum: ["applied", "pending", "rejected", "success","inreview","response-rejected"],
          required: true,
        },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Tester = mongoose.models.Tester || mongoose.model("Tester", testerSchema);
export default Tester;
