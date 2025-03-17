import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const Support = () => {
  const [activeRooms, setActiveRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  // Initialize socket connection once
  useEffect(() => {
    socketRef.current = io("http://localhost:8000");

    socketRef.current.on("connect", () => {
      console.log("✅ Connected:", socketRef.current.id);
      socketRef.current.emit("get_active_support_rooms");
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected:", socketRef.current.id);
    });

    socketRef.current.on("active_support_rooms", setActiveRooms);
    socketRef.current.on("new_support_room", (room) => {
      setActiveRooms((prev) => [...prev, room]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []); // Empty dependency array - runs once

  // Handle room-specific events
  useEffect(() => {
    if (!socketRef.current || !selectedRoom) return;

    const socket = socketRef.current;

    const messageHandler = (message) => {
      console.log("Received message:", message);
      if (message.roomId === selectedRoom) {
        setMessages((prev) => [
          ...prev,
          {
            ...message,
            // Add missing fields if needed
            timestamp: message.timestamp || new Date().toLocaleTimeString(),
          },
        ]);
      }
    };

    const botHandler = (message) => {
      if (message.roomId === selectedRoom) {
        setMessages((prev) => [
          ...prev,
          {
            text: message.text,
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
            roomId: message.roomId,
          },
        ]);
      }
    };

    socket.on("new_message", messageHandler);
    socket.on("bot_message", botHandler);

    return () => {
      socket.off("new_message", messageHandler);
      socket.off("bot_message", botHandler);
    };
  }, [selectedRoom]);

  const handleJoinRoom = (roomId) => {
    if (socketRef.current) {
      console.log("🔵 Joining room:", roomId);
      socketRef.current.emit("join_user_room", { roomId });
      setSelectedRoom(roomId);
      setMessages([]);
    }
  }; // Add this useEffect to monitor messages
  useEffect(() => {
    console.log("Current messages:", messages);
  }, [messages]);

  // Add this useEffect to monitor active rooms
  useEffect(() => {
    console.log("Active rooms updated:", activeRooms);
  }, [activeRooms]);

  const handleSendMessage = () => {
    if (input.trim() && selectedRoom && socketRef.current) {
      socketRef.current.emit("support_message", {
        roomId: selectedRoom,
        message: input.trim(),
      });
      setInput("");
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Active Support Rooms ({activeRooms.length})
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeRooms.map((room) => (
          <div key={room.roomId} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Room ID: {room.roomId}</h2>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleJoinRoom(room.roomId)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Join Room
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Chat with User</h2>
            <div className="h-64 overflow-y-auto mb-4 border p-2">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.timestamp}-${index}`}
                  className={`flex ${
                    msg.sender === "support" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg shadow ${
                      msg.sender === "support"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleSendMessage}
              className="mt-2 w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Send
            </button>
            <button
              onClick={() => setSelectedRoom(null)}
              className="mt-2 w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
