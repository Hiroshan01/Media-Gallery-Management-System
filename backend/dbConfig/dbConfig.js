import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();
const dbURI = process.env.DB_URI
async function connectDB() {
    try {
        await mongoose.connect(dbURI);
        console.log("Connected to Database Successfully");
    } catch (error) {
        console.error("Database Connection Failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;
