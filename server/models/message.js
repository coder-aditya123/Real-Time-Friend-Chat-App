import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, // Added index
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, // Added index
    text: { type: String },
    image: { type: String },
    video: { type: String },
    seen: { type: Boolean, default: false, index: true } // Added index
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;