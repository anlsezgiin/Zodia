import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import {connectDB} from "./lib/db.js"
import cookieParser from "cookie-parser";

dotenv.config();
const PORT = process.env.PORT;
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log("Server running on PORT:",PORT);
    connectDB();
})