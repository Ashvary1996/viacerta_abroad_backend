import jwt from "jsonwebtoken";
import User from "../models/users.js";

export const isAuthenticatedUser = async (req, res, next) => {
  try {
    const token = req.cookies?.auth_token; // Ensure it reads the correct cookie

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Token not available",
      });
    }

    const jwtUser = jwt.verify(token, process.env.JWT_SECRET);

    if (jwtUser) {
      const user = await User.findById(jwtUser.id);
      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found" });
      }

      req.user = user; // Attach user to request
      req.userId = user._id; // Attach userId to request
    }

    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    return res.status(401).json({ success: false, msg: "Authentication failed" });
  }
};

export const authorizedRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "User is not allowed to access this route." });
    }
    next();
  };
};
