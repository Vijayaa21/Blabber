import express from "express";
import authRoutes from "./routes/auth.routes.js"
import dotenv from"dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";

dotenv.config()

const app =  express();

const PORT = process.env.PORT || 5000

console.log(process.env.MONGO_URI)

app.use(express.json());
app.use(express.urlencoded({ extended:true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
    connectMongoDB();
});