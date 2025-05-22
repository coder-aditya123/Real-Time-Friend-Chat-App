import { generateToken } from "../lib/utils.js"; // .js extension added
import User from "../models/user.js"; // .js extension added
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js"; // .js extension added

// Signup a new user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.json({
      success: true,
      user: newUser, // ✅ renamed
      token,
      message: "Account created successfully",
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      user, // ✅ renamed
      token,
      message: "Login successful",
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;
    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    }

    res.json({ success: true, user: updatedUser });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
