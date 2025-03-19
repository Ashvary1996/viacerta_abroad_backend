import express from "express";
import {
  forgotPassword,
  login,
  logOut,
  me,
  resetPassword,
  signUp,
  updateProfile,
  verify,
} from "../controller/UserController.js";

const route = express.Router();

route.post("/signup", signUp);
route.post("/signup/verify", verify);
route.post("/login", login);
route.get("/me", me);
route.put("/update_profile", updateProfile);
route.post("/forgot_password", forgotPassword);
route.post("/reset-password", resetPassword);
route.post("/logout", logOut);

export default route;
