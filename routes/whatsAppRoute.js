import express from "express";

import { checkWhatsapp, whatsAppChat } from "../controller/WhatsAppController.js";

const route = express.Router();

route.post("/whatsapp", whatsAppChat);
route.get("/whatsapp", checkWhatsapp);

export default route;
