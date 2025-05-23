// client/src/pages/ProfilePage.jsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();

  // Initialize state using a functional update for useState to ensure correct initial values
  // and handle potential authUser being null on first render
  const [name, setName] = useState(() => authUser?.fullName || "");
  const [bio, setBio] = useState(() => authUser?.bio || "");

  // Update state when authUser changes after initial render
  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName);
      setBio(authUser.bio);
      // If authUser changes, clear selectedImg to show new profilePic
      setSelectedImg(null);
    }
  }, [authUser]);

  // Clean up URL.createObjectURL on component unmount or when selectedImg changes
  useEffect(() => {
    if (!selectedImg && authUser?.profilePic) {
      // If no new image is selected and authUser has a profile pic,
      // we might want to ensure the preview uses that.
      // This part might be tricky if you want to allow clearing image.
      // For now, it shows current authUser.profilePic if no new image is selected.
    }
    return () => {
      if (selectedImg) {
        URL.revokeObjectURL(selectedImg); // Clean up the object URL
      }
    };
  }, [selectedImg, authUser]); // Add authUser to dependencies for the initial state check

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!authUser) {
        toast.error("User not authenticated.");
        navigate("/login"); // Redirect to login if not authenticated
        return;
      }

      if (selectedImg) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Image = reader.result;
          const success = await updateProfile({ profilePic: base64Image, fullName: name, bio });
          if (success) {
            navigate("/");
          }
        };
        reader.onerror = (error) => {
          toast.error("Failed to read image file.");
          console.error("FileReader error:", error);
        };
        reader.readAsDataURL(selectedImg);
      } else {
        // If no new image is selected, update only name and bio
        const success = await updateProfile({ fullName: name, bio });
        if (success) {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(error.message || "Profile update failed.");
      console.error("Profile update failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center p-4"> {/* Added padding for small screens */}
      <div className="w-full max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg md:flex-row"> {/* Adjusted flex direction for medium+ screens */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-6 flex-1 sm:p-10" // Responsive padding
        >
          <h3 className="text-lg md:text-xl">Profile details</h3> {/* Responsive text size */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer text-sm md:text-base" // Responsive text size
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic || assets.avatar_icon
              }
              alt="avatar"
              className="w-12 h-12 rounded-full md:w-16 md:h-16" // Responsive image size
            />
            Upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-transparent text-white placeholder-gray-400 md:p-3" // Responsive padding and transparent bg
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-transparent text-white placeholder-gray-400 md:p-3" // Responsive padding and transparent bg
            rows={4}
          ></textarea>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer md:p-3 md:text-xl" // Responsive padding and text size
          >
            Save
          </button>
        </form>
        <img
          className="max-w-36 aspect-square rounded-full mx-auto my-10 max-sm:mt-10 md:max-w-44 lg:max-w-56" // Responsive image size, center alignment
          src={authUser?.profilePic || assets.logo_icon} // Use authUser?.profilePic or default logo_icon
          alt="logo"
        />
      </div>
    </div>
  );
};

export default ProfilePage;