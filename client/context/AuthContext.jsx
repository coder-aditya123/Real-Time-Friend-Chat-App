// client/context/AuthContext.jsx
import { createContext, useEffect, useState, useCallback, useRef } from "react"; // Added useRef
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

  // useRef to keep a mutable reference to the current socket instance
  // This helps avoid stale closures in effects and callbacks.
  const socketRef = useRef(null);

  const connectSocket = useCallback((user) => {
    // If a socket already exists and is connected, or if no user, do nothing
    if (!user || socketRef.current?.connected) {
      console.log("Socket connection skipped: User not available or socket already connected.");
      return;
    }

    console.log(`Attempting to connect socket for user: ${user._id}`);
    const newSocket = io(backendUrl, {
      query: { userId: user._id },
      transports: ["websocket"], // Explicitly prefer websockets
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setSocket(newSocket);
      socketRef.current = newSocket; // Update ref
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", newSocket.id, "Reason:", reason);
      // Only clear socket if it's the one we're tracking
      if (socketRef.current === newSocket) {
        setSocket(null);
        socketRef.current = null;
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      toast.error("Socket connection failed. Real-time features might not work.");
    });

    // Cleanup for this specific connection attempt
    // This return function will be called if connectSocket is called again before the previous one completes,
    // or if the component unmounts.
    return () => {
      console.log(`Cleaning up previous socket attempt: ${newSocket.id}`);
      newSocket.off("connect");
      newSocket.off("getOnlineUsers");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      if (newSocket.connected) {
        newSocket.disconnect();
      }
      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
    };
  }, [backendUrl]); // Removed `socket` from dependencies as `socketRef.current` is used for checks. Only `backendUrl` is needed.

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];
    if (socketRef.current) { // Use socketRef for disconnection
      socketRef.current.disconnect();
      setSocket(null); // Reset state
      socketRef.current = null; // Reset ref
      console.log("Socket disconnected on logout.");
    }
    toast.success("Logged out successfully");
  }, []);

  const login = useCallback(async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data.success) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setAuthUser(data.user);
        // The useEffect below will handle connectSocket call after authUser is set
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
  }, []);

  const updateProfile = useCallback(async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);

      if (data.success) {
        setAuthUser(data.user);
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
  }, []);

  // Primary effect for authentication and socket connection
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    const checkAuth = async () => {
      if (!token) {
        if (authUser || socketRef.current) { // Use socketRef
          logout();
        }
        return;
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const { data } = await axios.get("/api/auth/check");
        if (!isMounted) return;

        if (data.success) {
          setAuthUser(data.user);
          connectSocket(data.user); // Connect socket only after successful auth
        } else {
          logout();
        }
      } catch (error) {
        if (!isMounted) return;
        toast.error("Authentication failed. Please login again.");
        logout();
      }
    };

    checkAuth();

    return () => {
      isMounted = false; // Cleanup for mounted flag
    };
  }, [token, logout, connectSocket]); // Dependencies are correct for this effect

  // Removed the second useEffect managing socket connection/disconnection based on authUser.
  // The logic in the first useEffect and `connectSocket` should be sufficient.

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket, // Still expose socket for ChatContext to use
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};