import express from "express"
import weatherRoutes from "../services/weatherAPI/weather";
import { controllerAgent } from "../services/controllerQuestion/controllerAgent";

const router = express.Router()
router.use("/weather", weatherRoutes);

router.post("/chat", (req, res) => { controllerAgent.askQuestion(req, res) })

export default router