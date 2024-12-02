import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true,  // Auto-generates an ObjectId for the ticket
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    testerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tester",
      required: true,
    },
    messages: [
      {
        content: {
          type: String,
          required: true,
        },
        sender: {
          type: String,
          enum: ["tester", "admin","creator"],
          required: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    isOpen: {
      type: Boolean,
      default: true,  // Indicates the ticket is open by default
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

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
export default Ticket;
