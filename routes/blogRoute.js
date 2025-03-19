import express from "express";

const route = express.Router();

route.get("/blogs", get);

export default route;
