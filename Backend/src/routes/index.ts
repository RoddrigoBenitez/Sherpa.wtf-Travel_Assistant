import express from "express"
import { controllerAgent } from "../services/controllerQuestion/controllerAgent";

const router = express.Router()

router.post("/chat", (req, res) => { controllerAgent.askQuestion(req, res) })

export default router