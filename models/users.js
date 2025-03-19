import mongoose, { Schema } from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Not a valid email address",
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password Required"],
    },
    mobile: {
      type: String,
      required: [true, "Please enter your phone number"],
      unique: true,
      validate: {
        validator: function (value) {
          return /^\d{10}$/.test(value);
        },
        message: "Phone number must be 10 digits",
      },
    },
    address: {
      pinCode: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    favouriteCourse: {
      type: [Schema.Types.ObjectId],
      ref: "courses",
    },
    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    deleteAt: {
      type: Date, // Field for TTL index
    },
  },
  { timestamps: true }
);
// Add TTL index to auto-delete unverified users after OTP expiry

userSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model("users", userSchema);

export default User;
