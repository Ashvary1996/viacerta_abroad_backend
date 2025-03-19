import express from "express";

import {
  gettAllMbbsUsers,
  newMBBS_InterestedUser,
} from "../controller/campaign/mbbsController";

const route = express.Router();

route.post("/mbbs", newMBBS_InterestedUser);
route.get("/mbbs", gettAllMbbsUsers);

export default route;
