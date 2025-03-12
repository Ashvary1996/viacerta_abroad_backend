import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import connectToDb from "./config/dbConfig.js"; // Add `.js` to avoid ESM errors
import userRoutes from "./routes/usersRoute.js"; // Add `.js`

// const cors = require("cors");
// const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 8000;

// .................................................................

// Uncomment if CORS is needed
// const allowedOrigins = ["http://localhost:3000", process.env.CORS_ORIGIN || ""].filter(Boolean);

// app.use(
//   cors({
//     origin: allowedOrigins,
//     credentials: true,
//   })
// );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());

// .................................................................

 
app.use("/demo", (req, res) => res.send("Hello World"));

 
app.use("/api/user", userRoutes);
// app.use("/home", require("./routes/HomeRoute"));
// app.use("/product", require("./routes/ProductRoute"));
// app.use("/user/cart", require("./routes/CartRoute"));
// app.use("/order", require("./routes/OrderRoute"));

// .................................................................

// Start Server Immediately
app.listen(port, () => console.log(`🚀 Server running on port: ${port}`));

// Connect to Database (Without Blocking Server)
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

