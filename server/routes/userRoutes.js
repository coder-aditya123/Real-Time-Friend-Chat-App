import express from "express"
import { login, signup, updateProfile } from "../controllers/userController.js";
import { protectRoute, checkAuth } from "../middleware/auth.js"; // checkAuth को यहाँ से इम्पोर्ट करें

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter; 