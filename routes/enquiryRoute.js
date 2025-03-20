import express from "express";
import {
  createEnquiry,
  getAllEnquires,
} from "../controller/EnquiryController.js";

const route = express.Router();

route.post("/createEnquiry", createEnquiry); //working
route.get("/getEnquires", getAllEnquires); //working

export default route;
