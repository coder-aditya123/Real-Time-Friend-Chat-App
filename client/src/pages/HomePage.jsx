// client/src/pages/HomePage.jsx
import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const HomePage = () => {
  const { selectedUser, setSelectedUser } = useContext(ChatContext);

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid
          ${selectedUser
            ? "grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]" // When user is selected, for medium+ screens: 3 columns. Small screens handled by child component's max-md:hidden
            : "grid-cols-1 md:grid-cols-2" // When no user selected, for medium+ screens: 2 columns (Sidebar + ChatContainer placeholder). Small screens: 1 column (Sidebar will be visible by default)
          }`}
      >
        {/* Sidebar will hide on small screens (max-md) if selectedUser is true */}
        <Sidebar />
        {/* ChatContainer will show its placeholder message on small screens if no selectedUser */}
        <ChatContainer selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        {/* RightSidebar will always hide on small screens (max-md) */}
        <RightSidebar selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default HomePage;