// client/src/components/ChatContainer.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const { messages, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers = [] } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  // New state for modal image
  const [modalImage, setModalImage] = useState(null); // Stores the URL of the image to display in modal

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = ""; // Clear file input
    };
    reader.readAsDataURL(file);
  };

  // Function to open the image in the modal
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  // Function to close the modal
  const closeImageModal = () => {
    setModalImage(null);
  };

  if (!selectedUser || !authUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
        <img src={assets.logo_icon} className="max-w-16" alt="icon" />
        <p className="text-lg font-medium text-white">Select a user to start chat</p>
        {/* Optional: A basic welcome message for mobile users */}
        <p className="md:hidden text-sm text-gray-400 mt-2">
          Please select a chat from the left panel.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-scroll relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="profile"
          className="w-12 h-12 rounded-full"
        />
        <p className="flex-1 text-lg md:text-xl text-white flex items-center gap-2">
          {selectedUser?.fullName}
          {selectedUser?._id && onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="icon"
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img
          src={assets.help_icon}
          alt="icon"
          className="max-md:hidden max-w-5"
        />
      </div>

      {/* Chat messages area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser?._id ? "flex-row-reverse" : ""
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt="sent media"
                // Adjusted classes for smaller size and responsiveness
                className="max-w-[150px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[250px] border border-gray-700 rounded-lg overflow-hidden mb-8 cursor-pointer shadow-lg"
                onClick={() => openImageModal(msg.image)} // Open in modal
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] sm:max-w-[250px] md:max-w-xs lg:max-w-md text-sm md:text-base font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                  msg.senderId === authUser?._id
                    ? "rounded-br-none"
                    : "rounded-bl-none"
                }`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser?._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt={msg.senderId === authUser?._id ? authUser?.fullName : selectedUser?.fullName}
                className="w-7 md:w-8 rounded-full"
              />
              <p className="text-gray-500 text-xs md:text-sm">{formatMessageTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input and send buttons */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-black/30">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm md:text-base p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
          />
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
            onChange={handleSendImage}
          />
          <label htmlFor="image" className="cursor-pointer">
            <img
              src={assets.gallery_icon}
              alt="gallery"
              className="w-5 md:w-6 mr-2"
            />
          </label>
        </div>
        <img
          src={assets.send_button}
          alt="send"
          className="w-7 md:w-8 cursor-pointer"
          onClick={handleSendMessage}
        />
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={closeImageModal} // Click outside to close
        >
          <img
            src={modalImage}
            alt="Full screen media"
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
          />
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 text-white text-3xl font-bold cursor-pointer bg-red-600 rounded-full w-10 h-10 flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;