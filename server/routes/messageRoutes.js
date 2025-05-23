// server/routes/messageRoutes.js
import express from "express";
// deleteMessage को इम्पोर्ट करें
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage, deleteMessage } from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js"; // .js extension added

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.get("/mark/:id", protectRoute, markMessageAsSeen); // Note: Typically mark as seen would be a PUT request
messageRouter.post("/send/:id", protectRoute, sendMessage);

// --- नया DELETE रूट ---
messageRouter.delete("/delete/:id", protectRoute, deleteMessage); // New route for deleting messages

export default messageRouter;