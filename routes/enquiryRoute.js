import express from "express";
import { createEnquiry, getAllEnquires } from "../controller/EnquiryController";

const route = express.Router();

route.post("/counseling", createEnquiry);
route.get("/counseling", getAllEnquires);

export default route;
