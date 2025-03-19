import { jwtVerify } from "jose";
import * as cookie from "cookie";

export async function authenticate(request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      console.log("No cookie found");
      return { success: false, message: "Unauthorized: No cookie found" };
    }

    const cookies = cookie.parse(cookieHeader);
    const token = cookies.auth_token;

    if (!token) {
      console.log("No token provided");
      return { success: false, message: "Unauthorized: No token provided" };
    }
    console.log("Received Token:", token);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret is missing in environment variables.");
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log("Decoded Payload:", payload);
    // console.log("Request Cookies:", request.headers.get("cookie"));

    return { success: true, user: payload };
  } catch (error) {
    // console.log("Request Cookies:", request.headers.get("cookie"));

    console.error("JWT Verification Error:", error.message);

    return {
      success: false,
      message:
        error.code === "ERR_JWT_EXPIRED"
          ? "Token expired. Please log in again."
          : "Invalid or expired token.",
      error: error.message,
    };
  }
}
