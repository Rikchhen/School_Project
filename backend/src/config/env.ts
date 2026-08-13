import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Central environment configuration. Every env var the app reads is declared,
 * validated, and typed here so the rest of the codebase can import a single
 * strongly-typed `env` object instead of touching `process.env` directly.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGO_URL: z
    .string()
    .min(1, "MONGO_URL is required")
    .default("mongodb://127.0.0.1:27017/adarsha_school"),
  JWT_SECRET_TOKEN: z
    .string()
    .min(10, "JWT_SECRET_TOKEN must be at least 10 characters")
    .default("dev_only_insecure_secret_change_me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  COOKIE_NAME: z.string().default("adarsha_token"),
  CLIENT_URL: z.string().default("http://localhost:5180"),

  // Seed-only values (optional in normal runtime)
  SEED_ADMIN_EMAIL: z.string().email().default("admin@adarsha.edu.np"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("Admin@12345"),
  SEED_ADMIN_NAME: z.string().default("School Administrator"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast with a readable message rather than crashing deep in the app.
  console.error("❌ Invalid environment configuration:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;

export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
