import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`);
        console.log(process.env.MONGO_URI);
        console.log(process.env.PORT);
    } catch(error){
        console.error(`Error connection to mongoDB: ${error.message}`);
        console.log(process.env.MONGO_URI);
        process.exit(1);
    }
}

export default connectMongoDB