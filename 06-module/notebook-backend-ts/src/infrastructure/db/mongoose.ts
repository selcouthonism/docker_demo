import mongoose from "mongoose";
import { config } from "../../config/config.js";

export async function connectMongo(): Promise<void> {
  const uri = config.mongoUri;

  if (!uri) {
    console.error("DB_URL is not defined in env!");
    process.exit(1);
  }
  
  await mongoose.connect(uri, {
  
  }).catch(err => {
    console.error('Something went wrong!');
    console.error(err);
  });
  
  console.log("Connected to MongoDB");
}
