import jwt from "jsonwebtoken";  
import * as cookie from "cookie";

export async function authenticate(request) {
  try {
    // Check if the request has cookies
    const cookieHeader = request.headers.cookie; // Use request.headers.cookie for Express
    if (!cookieHeader) {
      console.log("No cookie found in request headers");
      return { success: false, message: "Unauthorized: No cookie found" };
    }

    // Parse the cookies
    const cookies = cookie.parse(cookieHeader);
    const token = cookies.auth_token;

    // Check if the token exists
    if (!token) {
      console.log("No auth_token found in cookies");
      return { success: false, message: "Unauthorized: No token provided" };
    }

    // Ensure JWT secret is available
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret is missing in environment variables.");
    }

    // Verify the token using jsonwebtoken
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified successfully. Decoded Payload:", payload);

    // Return the decoded payload
    return { success: true, user: payload };
  } catch (error) {
    console.error("JWT Verification Error:", error.message);

    // Handle specific JWT errors
    let errorMessage = "Invalid or expired token.";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token expired. Please log in again.";
    }

    return {
      success: false,
      message: errorMessage,
      error: error.message,
    };
  }
}