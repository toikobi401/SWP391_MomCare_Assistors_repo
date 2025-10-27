import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { infoUser, isLogin } = useAuth();

  useEffect(() => {
    if (isLogin && infoUser?.UserID) {
      // Kết nối Socket.IO
      const socketInstance = io("http://localhost:5000", {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", () => {
        console.log("✅ Socket connected:", socketInstance.id);
        setConnected(true);

        // Join user room để nhận notifications
        socketInstance.emit("join", infoUser.UserID);
      });

      socketInstance.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setConnected(false);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnected(false);
      });

      setSocket(socketInstance);

      // Cleanup khi unmount
      return () => {
        console.log("🔌 Disconnecting socket...");
        socketInstance.disconnect();
      };
    }
  }, [isLogin, infoUser]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
