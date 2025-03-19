import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const Support = () => {
  const [activeRooms, setActiveRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isClosing, setIsClosing] = useState(false); // New state for closing animation
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const handleRoomClosed = useCallback(
    ({ roomId }) => {
      setActiveRooms((prev) => prev.filter((room) => room.roomId !== roomId));

      if (selectedRoom === roomId) {
        setIsClosing(true);
        setTimeout(() => {
          setSelectedRoom(null);
          setMessages([]);
          setIsClosing(false);
        }, 3000);
      }
    },
    [selectedRoom]
  );
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
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              m.text === message.text &&
              m.sender === message.sender &&
              m.timestamp === message.timestamp
          );
          return exists ? prev : [...prev, message];
        });
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
    socket.on("support_room_closed", handleRoomClosed);
    socket.on("new_message", messageHandler);
    socket.on("bot_message", botHandler);

    return () => {
      socket.off("new_message", messageHandler);
      socket.off("bot_message", botHandler);
      socket.off("support_room_closed", handleRoomClosed);
    };
  }, [selectedRoom, handleRoomClosed]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, handleRoomClosed]);

  const handleJoinRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit("join_user_room", { roomId });
      setSelectedRoom(roomId);
      setMessages([]);
      setIsClosing(false); // Reset closing state when joining a new room
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeRooms.map((room, index) => (
          <div
            key={room.roomId}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-gray-500 mr-2">#{index + 1}</span>
                  <h2 className="text-lg font-semibold">
                    Room ID: {room.roomId}
                  </h2>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleJoinRoom(room.roomId)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                  >
                    Join Room
                  </button>
                  <button
                    onClick={() => {
                      const isConfirmed = window.confirm("Are you sure you want to close this room?");
                      if (isConfirmed && socketRef.current) {
                        socketRef.current.emit("close_support_room", {
                          roomId: room.roomId,
                        });
                      }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                  >
                    Close Room
                  </button>
                </div>
              </div>
              {selectedRoom === room.roomId && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                  Active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-opacity duration-1000 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chat Room #{selectedRoom}</h2>
              <button
                onClick={() => {
                  setIsClosing(true);
                  setTimeout(() => setSelectedRoom(null), 3000);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="h-64 overflow-y-auto mb-4 border rounded-lg p-3 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.timestamp}-${index}`}
                  className={`flex ${
                    msg.sender === "support" ? "justify-end" : "justify-start"
                  } mb-3`}
                >
                  <div
                    className={`flex items-start max-w-xs ${
                      msg.sender === "support" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="mr-2 text-xl">
                      {msg.sender === "bot" && "🤖"}
                      {msg.sender === "user" && "🧑"}
                      {msg.sender === "support" && "👩‍💻"}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg shadow ${
                        msg.sender === "support"
                          ? "bg-purple-500 text-white"
                          : msg.sender === "bot"
                          ? "bg-purple-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
