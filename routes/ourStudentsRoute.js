import express from "express";
import { allStudents } from "../controller/OurStudentsController.js";

const route = express.Router();

route.get("/getAll", allStudents); //working

export default route;
