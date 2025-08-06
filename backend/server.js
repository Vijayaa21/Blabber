import express from "express";
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import dotenv from"dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import cors from 'cors';



dotenv.config()

const app =  express();
const BASE_URL = "https://blabber-av0p.onrender.com/"; // example

const PORT = process.env.PORT || 5000

console.log(process.env.MONGO_URI)

app.use(cors({
  origin: [
    "https://blabber-front.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({ extended:true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the Blabber server");
});   




app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
    connectMongoDB();
});