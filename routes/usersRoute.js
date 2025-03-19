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

route.post("/signup", signUp); // working
route.post("/signup/verify", verify); // working
route.post("/login", login); //working
route.get("/me", me); //working
route.put("/update_profile", updateProfile);
route.post("/forgot-password", forgotPassword); // working
route.post("/reset-password", resetPassword); // working
route.post("/logout", logOut); //working

export default route;
