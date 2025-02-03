import express from "express"
import router from "./routes/index"



const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5001
const HOST = process.env.HOST || "localhost"


app.use("/api", router)

app.listen(PORT, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`)
})