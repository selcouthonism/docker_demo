import mongoose from "mongoose";
import { config } from "../../config/index.js";

export async function connectMongo(): Promise<void> {
  const uri = config.mongoUri;
  
  await mongoose.connect(uri, {
  });
  
  console.log("Connected to MongoDB");
}
