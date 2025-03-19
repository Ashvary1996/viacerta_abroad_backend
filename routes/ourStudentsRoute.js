import express from "express";
import { allStudents } from "../controller/OurStudentsController";

const route = express.Router();

route.get("/students", allStudents);

export default route;
