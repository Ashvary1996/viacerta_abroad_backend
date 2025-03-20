import express from "express";
import {
  getAllMbbsUsers,
  newMBBS_InterestedUser,
} from "../controller/campaign/mbbsController.js";

const route = express.Router();

route.get("/mbbs/getAll", getAllMbbsUsers); //working
route.post("/mbbs/new_mbbs", newMBBS_InterestedUser); //working

export default route;
