// client/src/components/Sidebar.jsx
import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser } = useContext(ChatContext); // Removed unseenMessages, setUnseenMessages
  const { authUser, logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const filteredUsers = input ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white
        ${selectedUser ? "max-md:hidden" : ""}`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-[150px] md:max-w-[180px] lg:max-w-[200px]" />

          {/* Profile icon with dropdown for authUser */}
          <div className="relative py-2 group">
            <img
              src={authUser?.profilePic || assets.avatar_icon}
              alt="User Profile"
              className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-32 md:w-40 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300">
              <p onClick={() => navigate("/profile")} className="cursor-pointer text-sm md:text-base">Edit Profile</p>
              <hr className="my-2 border-t border-gray-500" />
              <p onClick={() => logout()} className="cursor-pointer text-xs md:text-sm">Logout</p>
            </div>
          </div>
        </div>

        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-4 md:w-5" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-xs md:text-sm placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      <div className="flex flex-col">
        {filteredUsers.map((user) => (
          <div
            onClick={() => {
              setSelectedUser(user);
              // When a user is selected, their unseen messages should be 0 in the UI
              // Update the users state directly to reflect this
              getUsers(); // Refetch users to get updated unseen counts for all other users
            }}
            key={user._id}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer text-sm md:text-base ${selectedUser?._id === user._id && "bg-[#282142]/50"
            }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt="Profile"
              className="w-[35px] md:w-10 lg:w-12 aspect-[1/1] rounded-full"
            />
            <div className="flex flex-col leading-5">
              <p className="text-sm md:text-base">{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs md:text-sm">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs md:text-sm">Offline</span>
              )}
            </div>
            {/* Access unseenCount directly from the user object */}
            {user.unseenCount > 0 && ( // <--- Line 81 यहाँ थी
              <p className="absolute top-4 right-1 text-xs md:text-sm h-5 w-5 md:h-6 md:w-6 flex justify-center items-center rounded-full bg-violet-500/50">
                {user.unseenCount}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;