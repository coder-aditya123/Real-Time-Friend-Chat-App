// client/src/components/RightSidebar.jsx
import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = ({ selectedUser }) => {
  const { messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);

  const [msgImages, setMsgImages] = useState([]);
  // New state for modal image in RightSidebar
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    if (!selectedUser) {
      setMsgImages([]);
      return;
    }

    // Filter unique images from messages related to the selected user
    const uniqueImages = messages
      .filter((msg) => msg.image && (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id))
      .map((msg) => ({ id: msg._id, url: msg.image }));
    
    // Optional: If you want to ensure no duplicate image URLs even if _id is different
    const uniqueImageUrls = Array.from(new Set(uniqueImages.map(img => img.url)))
      .map(url => uniqueImages.find(img => img.url === url));

    setMsgImages(uniqueImageUrls); // Using uniqueImageUrls
  }, [messages, selectedUser]);

  // Function to open the image in the modal
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  // Function to close the modal
  const closeImageModal = () => {
    setModalImage(null);
  };

  if (!selectedUser) return null;

  return (
    <div className="bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll max-md:hidden">
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-20 md:w-24 lg:w-32 aspect-[1/1] rounded-full"
        />
        <h1 className="px-10 text-xl md:text-2xl font-medium mx-auto flex items-center gap-2">
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
          {selectedUser.fullName}
        </h1>
        <p className="px-10 mx-auto text-xs md:text-sm">{selectedUser.bio}</p>
      </div>

      <hr className="border-[#ffffff50] my-4" />

      <div className="px-5 text-xs">
        <p className="text-sm md:text-base">Media</p>
        <div className="mt-2 max-h-[200px] md:max-h-[250px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
          {msgImages.length ? (
            msgImages.map((imgData) => (
              <div
                key={imgData.id}
                onClick={() => openImageModal(imgData.url)} // Open in modal
                className="cursor-pointer rounded-lg overflow-hidden"
              >
                <img
                  src={imgData.url}
                  alt="media"
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-xs md:text-sm">No media shared yet.</p>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 w-full px-5">
        <button
          className="bg-[#B8416E] py-2 rounded-xl w-full text-base md:text-lg cursor-pointer hover:opacity-90 transition-opacity" // Added cursor-pointer and hover effect
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {/* Image Modal (Copied from ChatContainer but placed here) */}
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

export default RightSidebar;