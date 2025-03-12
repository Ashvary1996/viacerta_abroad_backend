import express from "express";
import { login, signUp, verify } from "../controller/userController.js";

const route = express.Router();

route.post("/signup", signUp);
route.post("/signup/verify", verify);
route.post("/login", login);

export default route;
