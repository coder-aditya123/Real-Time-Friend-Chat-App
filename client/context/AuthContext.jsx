import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Check if user is authenticated and set user data
  const checkAuth = async () => {
    if (!token) return;

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.userData);  // Corrected here
        if (!socket) {
          connectSocket(data.userData);
        }
      } else {
        logout();
      }
    } catch (error) {
      toast.error("Authentication check failed. Please login again.");
      logout();
    }
  };

  // Login or Signup function — only returns status
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);  // Corrected here
        connectSocket(data.userData);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed");
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];
    if (socket) socket.disconnect();
    toast.success("Logged out successfully");
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);  // Backend sends 'user' key here, so no change
        toast.success("Profile updated successfully");
        return true;
      } else {
        toast.error(data.message || "Profile update failed.");
        return false;
      }
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  // Socket connection
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
