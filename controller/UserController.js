import User from "../models/users.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const signUp = async (req, res) => {
  try {
    const { name, email, mobile, address, role, password } = req.body;

    if (!name || !email || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, and Mobile are required.",
      });
    }

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: "User already exists.",
        });
      }

      // User exists but is not verified, update details
      existingUser.name = name;
      existingUser.mobile = mobile;
      existingUser.address = address;
      existingUser.role = role;
      existingUser.password = await bcrypt.hash(password, 10);
    } else {
      existingUser = new User({
        name,
        email,
        mobile,
        password: await bcrypt.hash(password, 10),
        address,
        role,
        isVerified: false,
      });
    }

    const otp = crypto.randomInt(1000, 9999).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    existingUser.otp = await bcrypt.hash(otp, 10);
    existingUser.otpExpiry = otpExpiry;

    await existingUser.save();

    const data = { existingUser, otp };

    // await sendEmail(existingUser.email, data, "verifyOtp");

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete sign-up.",
      user: existingUser,
    });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

const verify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified. Please log in.",
      });
    }

    if (Date.now() > user.otpExpiry) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();

      return res.status(401).json({
        success: false,
        message: "OTP expired. Request a new one.",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token as a cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production", // Secure in production
        sameSite: "lax",
        path: "/",
      })
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. User signed up.",
      user: {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email or mobile number.",
      });
    }

    const isEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneNumber = mobile && /^\d{10}$/.test(mobile);

    if (!isEmail && !isPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or phone number format.",
      });
    }

    const user = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (isEmail) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required for email login.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials." });
      }
    } else if (isPhoneNumber) {
      const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP
      const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min validity
      const hashedOtp = await bcrypt.hash(otp, 10);

      user.otp = hashedOtp;
      user.otpExpiry = otpExpiry;
      await user.save();

      // await sendSmsOtp(mobile, otp);

      return res.status(200).json({
        success: true,
        message: "OTP sent to your mobile number.",
        userId: user._id,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token as a cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      })
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error." });
  }
};

export { signUp, verify, login };
