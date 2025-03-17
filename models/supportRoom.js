import mongoose from "mongoose";

const supportRoomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// Add TTL index for automatic deletion after 5 minutes
supportRoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SupportRoom = mongoose.model("support_room", supportRoomSchema);

export default SupportRoom;
