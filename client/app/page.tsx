"use client";

import { useState } from "react";
import Login from "@/components/Login";
import ChatWindow from "@/components/ChatWindow";
import { io, Socket } from "socket.io-client";

// Use environment variable for production, fallback to localhost for dev
const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

export default function Home() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleJoin = (user: string, roomName: string) => {
    const newSocket = io(SOCKET_URL);
    newSocket.emit("join_room", roomName);

    setUsername(user);
    setRoom(roomName);
    setSocket(newSocket);
  };

  if (!socket) {
    return <Login onJoin={handleJoin} />;
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 h-full flex items-center justify-center p-4">
        <div className="w-full h-full max-w-[1600px] glass rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <ChatWindow socket={socket} username={username} room={room} />
        </div>
      </div>
    </div>
  );
}
