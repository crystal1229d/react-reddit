import express from "express"
import morgan from "morgan"
import { AppDataSource } from "./data-source"
import authRoutes from './routes/auth'
import cors from 'cors'

const app = express();
const origin = "http://localhost:3000"

app.use(cors({
    origin, 
    credentials: true
}))
app.use(express.json());
app.use(morgan("dev")); // dev, short, common combined

app.get("/", (_, res) => res.send("running"));
app.use("/api/auth", authRoutes)

const port = 4000;

app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`)

    AppDataSource.initialize().then(() => {
        console.log("database initialized")
    }).catch(error => console.log(error))
})