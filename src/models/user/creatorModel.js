import mongoose from "mongoose";

const creatorSchema = new mongoose.Schema(
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
        task: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Task",
          required: true,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Creator =
  mongoose.models.Creator || mongoose.model("Creator", creatorSchema);
export default Creator;
