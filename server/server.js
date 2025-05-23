// server.js

import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http'; // Socket.IO के लिए आवश्यक
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io'; // Socket.IO को हटाया नहीं गया है, लेकिन यह Vercel पर काम नहीं करेगा
import errorHandler from './middleware/errorHandler.js';

// Express app और HTTP सर्वर बनाएँ
const app = express();
const server = http.createServer(app);

// Socket.IO सर्वर को इनिशियलाइज़ करें
// चेतावनी: Vercel एक सर्वरलेस वातावरण है और इस तरह के परसिस्टेंट Socket.IO कनेक्शन को सीधे सपोर्ट नहीं करता है।
// आपकी API रूट्स इस बदलाव के बाद काम करेंगी, लेकिन रियल-टाइम चैट के लिए आपको एक अलग समाधान की आवश्यकता होगी।
export const io = new Server(server, {
    cors: {
        origin: "*", // प्रोडक्शन में इसे अपने फ्रंटएंड डोमेन तक सीमित करें
    }
});

// ऑनलाइन यूजर्स को स्टोर करें
export const userSocketMap = {};

// Socket.IO कनेक्शन हैंडलर (यह Vercel पर उम्मीद के मुताबिक काम नहीं करेगा)
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`User Connected: ${userId} (Socket ID: ${socket.id})`);

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("Online Users:", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${userId} (Socket ID: ${socket.id})`);
        if (userId && userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        console.log("Online Users after disconnect:", Object.keys(userSocketMap));
    });
});

// Middleware सेटअप
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// API रूट्स
app.use("/api/status", (req, res) => res.send("Server is live on Vercel!"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// केंद्रीकृत एरर हैंडलिंग मिडलवेयर
app.use(errorHandler);

// MongoDB कनेक्शन
(async () => {
    try {
        await connectDB();
        console.log("MongoDB connected successfully on Vercel.");
    } catch (error) {
        console.error("MongoDB connection failed on Vercel:", error);
    }
})();

// ***** महत्वपूर्ण बदलाव: server.listen() को केवल लोकल डेवलपमेंट में चलाएँ। *****
// Vercel अपने आप आपके ऐप को लिस्टन करता है।
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => console.log("Server is running locally on PORT: " + PORT));
}

// ***** महत्वपूर्ण बदलाव: Vercel के लिए Express ऐप इंस्टेंस को एक्सपोर्ट करें। *****
// Vercel इस एक्सपोर्टेड 'app' ऑब्जेक्ट को आपके सर्वरलेस फ़ंक्शन के रूप में उपयोग करेगा।
export default app;