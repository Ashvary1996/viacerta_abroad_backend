import { Server } from "socket.io";
import faqData from "./faqData.js";
import SupportRoom from "./models/supportRoom.js";

const SUPPORT_HOURS = { start: 10, end: 23 };
const userRooms = new Map();
const activeSupportRooms = new Set();

const socketFn = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ New user connected: ${socket.id}`);
    // ____________________________________________________
    socket.on("joinRoom", async ({ roomId }) => {
      userRooms.set(socket.id, roomId);
      socket.join(roomId);
      console.log(`🔵 User ${socket.id} joined room: ${roomId}`);
      // ..

      const room = await SupportRoom.findOne({ roomId });
      if (room) {
        socket.emit("bot_message", {
          text: "You have an active support request. Please wait for an agent to join.",
          sender: "bot",
          roomId,
        });
      }
      //..

      if (!room) {
        setTimeout(() => {
          socket.emit("predefined_questions", {
            questions: faqData.questions.slice(0, 4).map((q) => q.question),
          });
        }, 2000);
      }
    });
    //
    socket.on("user_message", async ({ message, roomId }) => {
      const room = await SupportRoom.findOne({ roomId });
      if (room) {
        const userMessage = {
          text: message,
          sender: "user",
          timestamp: new Date().toLocaleTimeString(),
          roomId,
        };
        io.to(roomId).emit("new_message", userMessage);
        // ///////
        // socket.emit("bot_message", {
        //   text: "Chatbot responses are disabled while you have an active support request.",
        //   sender: "bot",
        //   roomId,
        // });
        return;
      }

      const lowerMessage = message.toLowerCase();
      const matchedFaq = faqData.questions.find(
        (q) => lowerMessage === q.question.toLowerCase()
      );
      if (matchedFaq) {
        const botResponse = {
          text: matchedFaq.answer,
          sender: "bot",
          followUp: matchedFaq.followUp || [],
        };
        setTimeout(() => {
          io.to(roomId).emit("bot_message", { ...botResponse, roomId });
        }, 1000);
      } else {
        const botResponse = {
          text: "I'm not sure about that. Please contact support.",
          sender: "bot",
          followUp: [],
        };
        setTimeout(() => {
          io.to(roomId).emit("bot_message", { ...botResponse, roomId });
        }, 1000);
      }
    });

    socket.on("request_support", async ({ roomId }) => {
      try {
        const existingRoom = await SupportRoom.findOne({ roomId });
        if (existingRoom) {
          socket.emit("bot_message", {
            text: "You have already requested support. Please wait for an agent to join.",
            sender: "bot",
            roomId,
          });
          return;
        }
        socket.emit("support_room_status", { exists: true });
        const currentHour = new Date().getHours();
        if (
          currentHour >= SUPPORT_HOURS.start &&
          currentHour < SUPPORT_HOURS.end
        ) {
          const newRoom = new SupportRoom({ roomId });
          await newRoom.save();
          //
          // supportRoomEmitter.emit('new_support_room',newRoom)
          //

          activeSupportRooms.add(roomId);
          io.emit("support_request", { roomId });
          io.emit("new_support_room", newRoom);
          io.to(roomId).emit("bot_message", {
            text: "A support agent will join soon. Please do not refresh this page. Chatbot responses will be disabled.",
            sender: "bot",
            roomId,
          });

          setTimeout(async () => {
            const room = await SupportRoom.findOne({ roomId });
            if (room && room.status === "active") {
              await SupportRoom.deleteOne({ roomId });
              io.to(roomId).emit("support_room_closed", { roomId });
              io.to(roomId).emit("bot_message", {
                text: "No support agent joined within 5 minutes. Please try again later.",
                sender: "bot",
                roomId,
              });
              activeSupportRooms.delete(roomId);
            }
          }, 5 * 60 * 1000); // 5 minutes
        } else {
          io.to(roomId).emit("bot_message", {
            text: "Live support is available from 10 AM to 6 PM. Please try again later.",
            sender: "bot",
            roomId,
          });
        }
      } catch (error) {
        console.error("Error handling support request:", error);
      }
    });

    socket.on("cancel_support_request", async ({ roomId }) => {
      try {
        const room = await SupportRoom.findOne({ roomId });
        if (room) {
          await SupportRoom.deleteOne({ roomId });
          activeSupportRooms.delete(roomId);

          io.emit("support_room_closed", { roomId });

          // Send updated room list to admin clients
          io.emit(
            "active_support_rooms",
            await SupportRoom.find({ status: "active" })
          );

          io.to(roomId).emit("bot_message", {
            text: "Support request has been closed.",
            sender: "bot",
            roomId,
          });
          socket.emit("support_room_status", { exists: false });
        }
      } catch (error) {
        console.error("Error closing support request:", error);
      }
    });

    socket.on("check_support_room", async ({ roomId }) => {
      try {
        const room = await SupportRoom.findOne({ roomId });
        socket.emit("support_room_status", { exists: !!room });
      } catch (error) {
        console.error("Error checking support room:", error);
      }
    });
    // --- admin side
    socket.on("get_active_support_rooms", async () => {
      try {
        const rooms = await SupportRoom.find({ status: "active" });
        socket.emit("active_support_rooms", rooms);
      } catch (error) {
        console.error("Error fetching active support rooms:", error);
      }
    });

    // socket.on("join_support_room", async ({ roomId }) => {
    //   try {
    //     const room = await SupportRoom.findOne({ roomId });
    //     if (room) {
    //       socket.join(roomId);
    //       socket.emit("joined_support_room", { roomId });
    //       io.to(roomId).emit("new_message", {
    //         text: "Support team has joined the chat.",
    //         sender: "bot",
    //         timestamp: new Date().toLocaleTimeString(),
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Error joining support room:", error);
    //   }
    // });
    socket.on("close_support_room", async ({ roomId }) => {
      try {
        await SupportRoom.deleteOne({ roomId });

        io.to(roomId).emit("support_room_closed", { roomId });
        io.emit(
          "active_support_rooms",
          await SupportRoom.find({ status: "active" })
        );

        io.to(roomId).emit("new_message", {
          text: "Support request has been closed.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        });
      } catch (error) {
        console.error("Error closing support room:", error);
      }
    });
    socket.on("support_message", ({ roomId, message }) => {
      const supportMessage = {
        text: message,
        sender: "support",
        timestamp: new Date().toLocaleTimeString(),
        roomId,
      };
      io.to(roomId).emit("new_message", supportMessage);
    });
    // ------
    // socket.on("join_user_room", ({ roomId }) => {
    //   console.log(`🔵 Support User ${socket.id} joined room: ${roomId}`);

    //   // if (!activeSupportRooms.has(roomId)) {
    //     activeSupportRooms.add(roomId);
    //   // }

    //   socket.join(roomId);
    //   io.to(roomId).emit("bot_message", {
    //     text: `A support agent has joined the chat Room id : ${roomId} . How can I assist you?`,
    //     sender: "bot",
    //     roomId,
    //   });
    //   io.emit("active_support_rooms", Array.from(activeSupportRooms));
    //   // Log the room joining event
    //   console.log(`✅ Support User ${socket.id} successfully joined room: ${roomId}`);
    // });
    // In your socket.io server code
    socket.on("join_user_room", async ({ roomId }) => {
      console.log(`🔵 Support User ${socket.id} joined room: ${roomId}`);

      try {
        const room = await SupportRoom.findOne({ roomId });
        if (!room) {
          console.log(`Room ${roomId} not found in database`);
          io.emit("support_room_closed", { roomId });
          return;
        }

        socket.join(roomId);
        io.emit(
          "active_support_rooms",
          await SupportRoom.find({ status: "active" })
        );

        io.to(roomId).emit("bot_message", {
          text: `Support agent has joined the chat (Room ID: ${roomId})`,
          sender: "bot",
          roomId,
        });
      } catch (error) {
        console.error("Error joining room:", error);
      }
    });

    // ____________________________________________________

    socket.on("disconnect", () => {
      const roomId = userRooms.get(socket.id);
      console.log(`❌ User ${socket.id} disconnected from room: ${roomId}`);

      // Cleanup server-side resources
      if (roomId) {
        activeSupportRooms.delete(roomId);
        SupportRoom.deleteOne({ roomId }).catch(console.error);
        io.emit("active_support_rooms", Array.from(activeSupportRooms));
      }

      userRooms.delete(socket.id);
    });

    // -----------------------------------------------------
  });
  return io;
};

export default socketFn;
