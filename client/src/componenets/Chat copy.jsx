import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";

function Chat() {
  const socketRef = useRef(null);
  const chatRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [preDefinedQuestions, setPreDefinedQuestions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showPredefined, setShowPredefined] = useState(false);
  const [isSupportRoomActive, setIsSupportRoomActive] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);

  useEffect(() => {
    let storedUserId = localStorage.getItem("ViaCerta_User");

    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem("ViaCerta_User", storedUserId);
    }
    setRoomId(storedUserId);

    socketRef.current = io("http://localhost:8000", {
      autoConnect: false,
    });
    socketRef.current.connect();
    const socket = socketRef.current;

    const handlePredefinedQuestions = ({ questions }) => {
      if (Array.isArray(questions)) {
        setPreDefinedQuestions(questions);
      }
    };

    socket.emit("joinRoom", { roomId: storedUserId });
    socket.on("predefined_questions", handlePredefinedQuestions);

    socket.on("new_message", (message) => {
      setMessages((prev) => {
        if (
          !prev.some(
            (m) => m.timestamp === message.timestamp && m.text === message.text
          )
        ) {
          return [...prev, message];
        }
        return prev;
      });
    });

    socket.on("bot_message", (response) => {
      const botMessage = {
        text: response.text,
        sender: "bot",
        followUp: response.followUp || [],
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    });

    setTimeout(() => {
      setShowPredefined(true);
    }, 1500);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  //  this useEffect to handle support room closure events
  useEffect(() => {
    const handleSupportRoomClosed = () => {
      setIsSupportRoomActive(false);
      localStorage.setItem(
        "isViaCertaSupportRoomActive",
        JSON.stringify(false)
      );
    };

    if (socketRef.current) {
      socketRef.current.on("support_room_closed", handleSupportRoomClosed);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("support_room_closed", handleSupportRoomClosed);
      }
    };
  }, []);

  useEffect(() => {
    if (roomId) {
      socketRef.current.emit("check_support_room", { roomId });

      socketRef.current.on("support_room_status", (status) => {
        setIsSupportRoomActive(status.exists);
      });
    }

    const storedStatus = JSON.parse(
      localStorage.getItem("isViaCertaSupportRoomActive")
    );
    if (storedStatus !== null) {
      setIsSupportRoomActive(storedStatus);
    }

    return () => {
      socketRef.current.off("support_room_status");
    };
  }, [roomId]);

  useEffect(() => {
    localStorage.setItem(
      "isViaCertaSupportRoomActive",
      JSON.stringify(isSupportRoomActive)
    );
  }, [isSupportRoomActive]);

  const isChatbotDisabled = isSupportRoomActive;

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handlePredefinedClick = (question) => {
    const userMessage = {
      text: question,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserMessageCount((prev) => prev + 1);
    socketRef.current.emit("user_message", { message: question, roomId });
  };

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    if (!isSupportRoomActive) {
      const userMessage = {
        text: trimmedInput,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, userMessage]);
    }

    setUserMessageCount((prev) => prev + 1);
    socketRef.current.emit("user_message", { message: trimmedInput, roomId });
    setInput("");
  };

  const clearChat = () => {
    setMessages([]);
    setPreDefinedQuestions([]);
    setShowPredefined(false);
    setUserMessageCount(0);
  };

  const requestSupport = () => {
    if (!roomId) {
      alert("Room ID is missing. Please try again.");
      return;
    }

    socketRef.current.emit("request_support", { roomId });
  };

  const handleCloseSupport = () => {
    socketRef.current.emit("cancel_support_request", { roomId });
  };

  return (
    <div className="flex flex-col h-[70vh] w-[60%] bg-gray-100 rounded-lg shadow-lg m-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">ViaCerta Bot</h2>
        <button
          className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition duration-200"
          onClick={clearChat}
        >
          Clear Chat
        </button>
      </div>

      {/* Chat messages container */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
      >
        {/* Welcome message */}
        <div className="flex justify-start">
          <div className="max-w-xs bg-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow">
            🤖 Hello! How can I help you today?
          </div>
        </div>

        {/* Predefined questions */}
        {!isChatbotDisabled && preDefinedQuestions.length > 0 && (
          <div className="space-y-2">
            {preDefinedQuestions.map((q, index) => (
              <button
                key={index}
                onClick={() => handlePredefinedClick(q)}
                className="block w-full text-left bg-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition duration-200"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start max-w-xs px-4 py-2 rounded-lg shadow ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white flex-row-reverse"
                  : msg.sender === "support"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {/* Emoji */}
              <div className="mr-2">
                {msg.sender === "bot" && "🤖"}
                {msg.sender === "user" && "🧑"}
                {msg.sender === "support" && "👩‍💻"}
              </div>

              {/* Message text */}
              <div>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
                {msg.followUp && Array.isArray(msg.followUp) && (
                <div className="mt-2">
                  {msg.followUp.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handlePredefinedClick(q)}
                      className="block w-full text-left bg-lime-800 text-white px-3 py-1 rounded mb-1 hover:bg-teal-700 transition duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 bg-gray-100 border-t border-gray-200 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSend}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
          >
            Send
          </button>
        </div>

        {/* Support buttons */}
        {isSupportRoomActive ? (
          <button
            onClick={handleCloseSupport}
            className="w-full mt-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition duration-200"
          >
            Close Support
          </button>
        ) : (
          userMessageCount >= 5 && (
            <button
              onClick={requestSupport}
              className="w-full mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-200"
            >
              Connect with Support
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default Chat;
