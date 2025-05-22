import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Make sure extension is correct (.js)

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ success: false, message: "Unauthorized: " + error.message });
  }
};

// ✅ Exported for checking auth (used in /api/auth/check route)
export const checkAuth = async (req, res) => {
  res.json({ success: true, user: req.user });
};
