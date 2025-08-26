import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js";
import productsRoutes from './routes/product.js'


dotenv.config()
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API is running..."));

// Use the login route
app.use("/api/auth", authRoutes)
app.use("/api/products", productsRoutes)


mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.log(`"Failed:"${error}`))


app.listen(process.env.PORT || 5050, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}/`)
})