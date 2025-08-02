import express from 'express';
import connectDB from './dbConfig/dbConfig.js';
import dotenv from "dotenv";
dotenv.config()

let app = express();

app.use(express.json());

connectDB()

app.listen(5000, () => {
    console.log("Server is running on port 5000");
})
// T3j9poaRm8mIZIdl

// hiroshandev