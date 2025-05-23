import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import errorHandler from './middleware/errorHandler.js'; // New: Import error handler

//Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

//Initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: "*", // Consider restricting this in production to your frontend domain
        // methods: ["GET", "POST"] // You can explicitly define allowed methods
    }
});

//Store online users
export const userSocketMap = {};  // {userId: socketId}

//Socket.io connection handler
io.on("connection", (socket) => {
    // Ensure userId is authenticated and valid here if not already done by a socket.io middleware
    const userId = socket.handshake.query.userId;
    console.log(`User Connected: ${userId} (Socket ID: ${socket.id})`);

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    //Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("Online Users:", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${userId} (Socket ID: ${socket.id})`);
        if (userId && userSocketMap[userId] === socket.id) { // Ensure correct socket is being deleted
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        console.log("Online Users after disconnect:", Object.keys(userSocketMap));
    });
});

//Middleware setup
app.use(express.json({ limit: "4mb" })); // Increased limit for potential larger images
app.use(cors());

app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// New: Centralized error handling middleware
app.use(errorHandler);

await connectDB();

if(process.env.NODE_ENV === "production"){
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
}

// Export server for Vercel
export default server;