import mongoose from "mongoose";
import { env } from "./env";

/**
 * Connect to MongoDB. Called from the server bootstrap (index.ts).
 * Tests use mongodb-memory-server and connect themselves, so this is not
 * imported there.
 */
export async function connectDB(uri: string = env.MONGO_URL): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}
