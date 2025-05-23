// client/context/ChatContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const { socket, axios, authUser } = useContext(AuthContext);

  // Get all users for sidebar
  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users.");
    }
  }, [axios]);

  // Get messages for selected user
  const getMessages = useCallback(async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error.message || "Failed to fetch messages.");
    }
  }, [axios]);

  // Send message to selected user
  const sendMessage = useCallback(async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
        if (authUser && selectedUser && data.newMessage.senderId === authUser._id && data.newMessage.receiverId === selectedUser._id) {
          setUsers(prevUsers =>
            prevUsers.map(u =>
              u._id === selectedUser._id ? { ...u, unseenCount: 0 } : u
            )
          );
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message.");
    }
  }, [axios, selectedUser, authUser]);

  // --- नया फ़ंक्शन: deleteMessage ---
  const deleteMessage = useCallback(async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/messages/delete/${messageId}`);
      if (data.success) {
        // Remove the deleted message from the state
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message || "Failed to delete message.");
        return false;
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to delete message.");
      return false;
    }
  }, [axios]);

  // New/Modified: Effect to handle incoming messages from socket.
  // It now updates the 'unseenCount' directly on the 'users' state.
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser?._id) {
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`)
          .catch(err => console.error(`Failed to mark message as read:`, err));
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u._id === selectedUser._id ? { ...u, unseenCount: 0 } : u
          )
        );
      } else if (newMessage.senderId !== authUser?._id && newMessage.receiverId === authUser?._id) {
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u._id === newMessage.senderId
              ? { ...u, unseenCount: (u.unseenCount || 0) + 1 }
              : u
            )
        );
      }
    };

    // --- नया Socket Event Handler: messageDeleted ---
    const handleMessageDeleted = ({ messageId, conversationId }) => {
      // Only remove if the deleted message is in the current chat
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      toast.success("A message was deleted from this chat."); // Inform the user
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted); // Listen for message deleted event

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted); // Clean up
    };
  }, [socket, selectedUser, axios, authUser]);

  // New useEffect to handle marking messages as seen when selectedUser changes
  useEffect(() => {
    const markAllMessagesAsSeen = async () => {
      if (selectedUser && authUser) {
        try {
          setUsers(prevUsers =>
            prevUsers.map(u =>
              u._id === selectedUser._id ? { ...u, unseenCount: 0 } : u
            )
          );
        } catch (error) {
          console.error("Error marking messages as seen:", error);
        }
      }
    };
    markAllMessagesAsSeen();
  }, [selectedUser, authUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    deleteMessage, // <-- deleteMessage को context में expose करें
    setSelectedUser,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};