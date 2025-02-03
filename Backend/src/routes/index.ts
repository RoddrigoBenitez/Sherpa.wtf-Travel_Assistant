import express from "express"

const router = express.Router()

router.get("/chat", (req, res)=>{
    res.send('Hello this page is for chat')
})

export default router