import express from "express";
import { getCourses } from "../controller/CoursesController.js";

const route = express.Router();

route.get("/all", getCourses); //working

export default route;
