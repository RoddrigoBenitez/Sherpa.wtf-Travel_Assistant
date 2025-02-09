import express from "express"
import { controllerAgent } from "../services/controllerQuestion/controllerAgent";

const router = express.Router()

// endpoint 
router.post("/chat", (req, res) => { controllerAgent.askQuestion(req, res) })

export default router