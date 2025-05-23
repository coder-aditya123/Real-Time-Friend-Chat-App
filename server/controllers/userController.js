import { generateToken } from "../lib/utils.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose"; // Added for ObjectId validation

// Helper for email validation (basic, could be more robust with regex)
const isValidEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email);
};

// Signup a new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        // Basic validation for required fields
        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: "Full Name, Email, and Password are required." });
        }

        // Sanitize and validate inputs
        const sanitizedFullName = String(fullName).trim();
        const sanitizedEmail = String(email).toLowerCase().trim();
        const sanitizedPassword = String(password); // Password will be hashed, no need to trim
        const sanitizedBio = bio ? String(bio).trim() : '';

        if (!isValidEmail(sanitizedEmail)) {
            return res.status(400).json({ success: false, message: "Invalid email format." });
        }

        if (sanitizedPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
        }

        const userExists = await User.findOne({ email: sanitizedEmail });
        if (userExists) {
            return res.status(409).json({ success: false, message: "Account with this email already exists." }); // 409 Conflict
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(sanitizedPassword, salt);

        const newUser = await User.create({
            fullName: sanitizedFullName,
            email: sanitizedEmail,
            password: hashedPassword,
            bio: sanitizedBio,
        });

        const token = generateToken(newUser._id);

        res.status(201).json({ // 201 Created
            success: true,
            user: newUser,
            token,
            message: "Account created successfully.",
        });

    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({
            success: false,
            message: "An error occurred during signup. Please try again later.",
        });
    }
};

// Login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation for required fields
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and Password are required." });
        }

        const sanitizedEmail = String(email).toLowerCase().trim();
        const sanitizedPassword = String(password);

        const user = await User.findOne({ email: sanitizedEmail });

        if (!user) {
            // Provide a generic message for security reasons
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const isPasswordCorrect = await bcrypt.compare(sanitizedPassword, user.password);

        if (!isPasswordCorrect) {
            // Provide a generic message for security reasons
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            user,
            token,
            message: "Login successful.",
        });

    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, message: "An error occurred during login. Please try again later." });
    }
};

// Update profile
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;

        // Validate userId from req.user
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID." });
        }

        let updateFields = {};

        if (fullName) {
            updateFields.fullName = String(fullName).trim();
            if (updateFields.fullName.length < 3) { // Example: minimum length for full name
                return res.status(400).json({ success: false, message: "Full name must be at least 3 characters long." });
            }
        }
        if (bio) {
            updateFields.bio = String(bio).trim();
        }
        if (profilePic) {
            try {
                const upload = await cloudinary.uploader.upload(profilePic);
                updateFields.profilePic = upload.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError.message);
                return res.status(500).json({ success: false, message: "Failed to upload profile picture." });
            }
        }

        // If no fields provided for update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ success: false, message: "No fields provided for update." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true, runValidators: true } // runValidators ensures schema validators run on updates
        ).select("-password"); // Don't return password

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, user: updatedUser, message: "Profile updated successfully." });

    } catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({ success: false, message: "An error occurred during profile update. Please try again later." });
    }
};