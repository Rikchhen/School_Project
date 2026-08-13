import { afterAll, afterEach, beforeAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Ensure the app reads a test-friendly configuration. Must run before the app
// (and thus config/env.ts) is imported by any test file.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET_TOKEN =
  process.env.JWT_SECRET_TOKEN ?? "test_secret_do_not_use_in_prod";
process.env.COOKIE_NAME = process.env.COOKIE_NAME ?? "adarsha_token";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  // Wipe all collections between tests so cases are independent.
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongo.stop();
});
