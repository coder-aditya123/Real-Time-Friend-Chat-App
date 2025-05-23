import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, trim: true }, // Added trim
    fullName: { type: String, required: true, trim: true }, // Added trim
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    bio: { type: String, trim: true }, // Added trim
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;