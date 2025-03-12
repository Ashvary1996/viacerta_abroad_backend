import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

const connectToDb = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables.");
    }

    const connection = await mongoose.connect(MONGO_URI);

    console.log("Connected to database successfully");

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error in database connection:", error.message);
    process.exit(1);
    // Exit process if DB connection fails
  }
};

export default connectToDb;
