import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const Support = () => {
  const [activeRooms, setActiveRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for auto-scroll

  // Initialize socket connection
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
  }, []);

  // Handle room-specific events
  useEffect(() => {
    if (!socketRef.current || !selectedRoom) return;

    const socket = socketRef.current;

    const messageHandler = (message) => {
      if (message.roomId === selectedRoom) {
        setMessages((prev) => [
          ...prev,
          {
            ...message,
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleJoinRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit("join_user_room", { roomId });
      setSelectedRoom(roomId);
      setMessages([]);
    }
  };

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

      {/* Active Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeRooms.map((room) => (
          <div
            key={room.roomId}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold">Room ID: {room.roomId}</h2>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleJoinRoom(room.roomId)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
              >
                Join Room
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl flex flex-col max-h-[90vh]">
            {/* Chat Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h2 className="text-xl font-bold">Chat with User</h2>
              <p className="text-sm">Room ID: {selectedRoom}</p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.timestamp}-${index}`}
                  className={`flex ${
                    msg.sender === "support" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start max-w-xs px-4 py-2 rounded-lg shadow ${
                      msg.sender === "support"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {/* Emoji */}
                    <div className="mr-2">
                      {msg.sender === "support" && "👩‍💻"}
                      {msg.sender === "user" && "🧑"}
                      {msg.sender === "bot" && "🤖"}
                    </div>

                    {/* Message Text */}
                    <div>{msg.text}</div>
                  </div>
                </div>
              ))}
              {/* Empty div for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleSendMessage}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
                >
                  Send
                </button>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
                >
                  Close Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
