import express from "express";
import {
  forgotPassword,
  login,
  logOut,
  me,
  resetPassword,
  signUp,
  updatePassword,
  updateProfile,
  verify,
} from "../controller/UserController.js";
import { authorizedRole, isAuthenticatedUser } from "../middleware/auth.js";

const route = express.Router();

route.post("/signup", signUp); // working
route.post("/signup/verify", verify); // working  //verify one more time beacause of genToken()
route.post("/login", login); //working
route.get("/me", isAuthenticatedUser, authorizedRole(["user"]), me); //working
route.put("/update_profile", isAuthenticatedUser,updateProfile); //working
route.put("/update_password",isAuthenticatedUser, updatePassword); //working
route.post("/forgot-password", forgotPassword); // working
route.post("/reset-password", resetPassword); // working
route.post("/logout", logOut); //working

export default route;
