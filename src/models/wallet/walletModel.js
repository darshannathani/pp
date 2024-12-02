import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userType", // Dynamic reference based on userType
      required: function () {
        return this.userType !== "System"; // 'user' is required only for non-system users
      },
    },
    userType: {
      type: String,
      enum: ["Tester", "Creator", "System"], // Define the user types
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
export default Wallet;
