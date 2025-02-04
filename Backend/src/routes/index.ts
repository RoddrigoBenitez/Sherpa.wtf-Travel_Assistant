import express from "express"
import weatherRoutes from "../services/weatherAPI/weather";

const router = express.Router()
router.use("/weather", weatherRoutes);

router.get("/chat", (req, res)=>{
    res.send('Hello this page is for chat')
})

export default router