import express from "express"
import weatherRoutes from "../services/weatherAPI/weather";
//import askAgent from "../agents/conversationManeger";

const router = express.Router()
router.use("/weather", weatherRoutes);

router.get("/chat", (req, res)=>{
    res.send(askAgent('pero me hablaste de corrientes anterioremente, no seguis el hilo? estas configurado en { configurable: { thread_id: "1" } }'))
})

export default router