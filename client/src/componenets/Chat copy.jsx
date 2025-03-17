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

  // ////////
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
    // _________ Socket events _________
    socket.emit("joinRoom", { roomId: storedUserId });
    socket.on("predefined_questions", handlePredefinedQuestions);
    //

    socket.on("new_message", (message) => {
      // setMessages((prev) => [...prev, message]);

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
    //

    socket.on("bot_message", (response) => {
      const botMessage = {
        text: response.text,
        sender: "bot",
        followUp: response.followUp || [],
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    });

    // _________
    setTimeout(() => {
      setShowPredefined(true);
    }, 1500);

    return () => {
      if (socket) {
        socket.disconnect();
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
    // socketRef.current("support_joined", ({ roomId }) => {
    //   // setRoomsWithSupport((prev) => new Set(prev).add(roomId));
    // });
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

  // Handle predefined question click
  const handlePredefinedClick = (question) => {
    const userMessage = {
      text: question,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    socketRef.current.emit("user_message", { message: question, roomId });

    setUserMessageCount((prev) => prev + 1);
  };

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
// //
    
if(!isSupportRoomActive){
  const userMessage = {
    text: trimmedInput,
    sender: "user",
    timestamp: new Date().toLocaleTimeString(),
  };
  setMessages((prev) => [...prev, userMessage]);
}

    // //
    socketRef.current.emit("user_message", { message: trimmedInput, roomId });
    setInput("");
    setUserMessageCount((prev) => prev + 1);
  };

  const clearChat = () => {
    setMessages([]);
    setPreDefinedQuestions([]);
    setShowPredefined(false);
    // setTimeout(() => {
    //   setMessages([
    //     { sender: "bot", text: "Hello! How can I help you today?" },
    //   ]);
    // }, 1000);
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
    <div className="w-96 border border-gray-300 rounded-lg flex flex-col bg-gray-100 shadow-lg m-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-3">
        <h2 className="text-lg font-semibold">ViaCerta Bot</h2>
        <button
          className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          onClick={clearChat}
        >
          Clear Chat
        </button>
      </div>

      {/* Chat messages container */}
      <div ref={chatRef} className="overflow-y-auto p-3 space-y-2 h-64 ">
        <h2 className="font-medium text-left p-1">
          🤖 "Hello! How can I help you today?"
        </h2>

        {isChatbotDisabled ? (
          <div className="text-center text-gray-500">
            Chatbot responses are disabled while you have an active support
            request.
          </div>
        ) : (
          <>
            {preDefinedQuestions.length > 0 && (
              <div className="mt-2">
                {preDefinedQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handlePredefinedClick(q)}
                    className="block w-full text-left bg-blue-500 text-white px-3 py-1 rounded mb-1 hover:bg-blue-700 transition duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </>
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
              className={`max-w-xs px-3 py-2 rounded-lg shadow ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {msg.sender === "bot" ? "🤖" : "🧑"}{" "}
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
        ))}
      </div>

      {/* Input area */}
      <div className="flex mt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-200"
        >
          Send
        </button>
      </div>

      {isSupportRoomActive ? (
        <button
          onClick={handleCloseSupport}
          className="mt-2 w-full bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-900 transition duration-200"
        >
          Close Support
        </button>
      ) : (
        userMessageCount >= 5 && (
          <button
            onClick={requestSupport}
            className="mt-2 w-full bg-orange-500 text-white px-3 py-1 rounded hover:bg-yellow-700 transition duration-200"
          >
            Connect with Support
          </button>
        )
      )}
    </div>
  );
}

export default Chat;
