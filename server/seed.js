import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "./db.js";

await connectDatabase();
console.log("MongoDB seed complete");
await mongoose.connection.close();
