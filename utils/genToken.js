import jwt from "jsonwebtoken";

export const generateToken = (user, res) => {
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

  res.cookie("auth_token", token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production", // Secure only in production
    sameSite: "None", // Required for cross-origin authentication
    path: "/", // Available throughout the site
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
  });
  console.log("Cookies Set");
};
