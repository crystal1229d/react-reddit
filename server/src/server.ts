import express from "express";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(morgan("dev")); // dev, short, common combined

app.get("/", (_, res) => res.send("running"));

const port = 4000;

app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`)
})