import express from "express"



const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5001
const HOST = process.env.HOST || "localhost"


app.get('/api', (req, res)=>{
    res.send('hello world')
})

app.listen(PORT, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`)
})