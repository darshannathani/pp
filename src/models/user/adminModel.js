import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
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
        password: { type: String, required: true }, 
        resetpasswordToken: String,
        resetpasswordExpires: Date,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);    
export default Admin;