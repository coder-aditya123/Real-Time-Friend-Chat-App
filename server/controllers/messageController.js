import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import mongoose from "mongoose"; // Added for ObjectId validation

// Get all users except the logged-in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all users except the logged-in user, and return as plain JavaScript objects
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password").lean();

        // Aggregate unseen messages counts for the logged-in user from all other users
        const unseenMessagesAggregate = await Message.aggregate([
            {
                $match: {
                    receiverId: userId,
                    seen: false
                }
            },
            {
                $group: {
                    _id: "$senderId", // Group by sender to count unseen messages from each sender
                    count: { $sum: 1 }
                }
            }
        ]);

        const unseenMessages = {};
        unseenMessagesAggregate.forEach(item => {
            unseenMessages[item._id.toString()] = item.count; // Convert ObjectId to string for key
        });

        // Combine unseen messages with user data
        const usersWithUnseenCounts = filteredUsers.map(user => ({
            ...user,
            unseenCount: unseenMessages[user._id.toString()] || 0
        }));

        res.status(200).json({ success: true, users: usersWithUnseenCounts });
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch users and unseen messages." });
    }
};

// Get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        // Validate selectedUserId
        if (!mongoose.Types.ObjectId.isValid(selectedUserId)) {
            return res.status(400).json({ success: false, message: "Invalid selected user ID." });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        }).lean(); // Use .lean() for faster pure JS objects

        // Mark messages as seen only if the logged-in user is the receiver and they haven't been seen yet
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false },
            { seen: true }
        );

        res.status(200).json({ success: true, messages });

    } catch (error) {
        console.error("Error in getMessages:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch messages." });
    }
};

// API to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate message ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid message ID." });
        }

        const message = await Message.findByIdAndUpdate(id, { seen: true }, { new: true });

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found." });
        }

        res.status(200).json({ success: true, message: "Message marked as seen." });
    } catch (error) {
        console.error("Error in markMessageAsSeen:", error.message);
        res.status(500).json({ success: false, message: "Failed to mark message as seen." });
    }
};

// Send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const senderId = req.user._id;
        const receiverId = req.params.id;

        // Validate receiverId
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ success: false, message: "Invalid receiver ID." });
        }

        // Basic input validation for text and image
        if (!text && !image) {
            return res.status(400).json({ success: false, message: "Message must contain text or an image." });
        }

        let imageUrl = null;
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError.message);
                return res.status(500).json({ success: false, message: "Failed to upload image." });
            }
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: text ? String(text).trim() : null, // Sanitize text
            image: imageUrl,
        });

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json({ success: true, newMessage }); // 201 Created

    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({ success: false, message: "Failed to send message." });
    }
};

