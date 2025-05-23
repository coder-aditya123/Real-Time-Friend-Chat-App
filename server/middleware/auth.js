import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided." });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: Token is missing." });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === "TokenExpiredError") {
                return res.status(401).json({ success: false, message: "Unauthorized: Token expired." });
            }
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid token." });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        // Catch any unexpected errors that might occur during the process
        console.error("Authentication error:", error.message);
        res.status(500).json({ success: false, message: "An internal server error occurred during authentication." });
    }
};

// Exported for checking auth (used in /api/auth/check route)
export const checkAuth = async (req, res) => {
    // If protectRoute passed, then req.user is available
    if (req.user) {
        res.status(200).json({ success: true, user: req.user, message: "User is authenticated." });
    } else {
        // This case should ideally not be hit if protectRoute is used correctly
        res.status(401).json({ success: false, message: "User not authenticated." });
    }
};