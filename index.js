import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import connectToDb from "./config/dbConfig.js"; // Add `.js` to avoid ESM errors
import userRoutes from "./routes/usersRoute.js"; // Add `.js`
import { createServer } from "http";
import cors from "cors";
import socketFn from "./socketConnector.js";

// const cookieParser = require("cookie-parser");

const app = express();
const server = createServer(app);
const port = process.env.PORT || 8000;
socketFn(server);

// .............................................................

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());

// .................................................................

app.use("/demo", (req, res) => res.send("Hello World"));
app.use("/api/user", userRoutes);

// ///////////////////////////////

server.listen(port, () => console.log(`🚀 Server running on port: ${port}`));

connectToDb().catch((err) => {
  console.error("⚠️ Database connection failed:", err.message);
});

// .................................................................

// Handle Uncaught Errors (Optional but Recommended)
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

export default app;
