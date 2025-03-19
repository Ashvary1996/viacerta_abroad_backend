import express from "express";
import { getCourses } from "../controller/CoursesController";

const route = express.Router();

route.get("/courses", getCourses);

export default route;
