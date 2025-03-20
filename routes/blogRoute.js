import express from "express";
import { getBlogById, getBlogs } from "../controller/BlogController.js";

const route = express.Router();

route.get("/all", getBlogs); //working
route.get("/:blogId", getBlogById);
export default route; //working
