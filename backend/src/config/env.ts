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
  JWT_EXPIRES_IN: z.string().default("30m"),
  SESSION_IDLE_MINUTES: z.coerce.number().int().min(5).max(1440).default(30),
  COOKIE_NAME: z.string().default("adarsha_token"),
  CLIENT_URL: z.string().default("http://localhost:5180"),
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
  DONOR_RETENTION_DAYS: z.coerce.number().int().min(1).max(3650).default(90),
  DONOR_DOCUMENT_KEY: z.string().optional().default(""),
  CLAMAV_ENABLED: z.string().default("false").transform((v) => v === "true"),
  CLAMAV_COMMAND: z.string().default("clamdscan"),

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

if (isProd) {
  if (env.JWT_SECRET_TOKEN.length < 32 || env.JWT_SECRET_TOKEN === "dev_only_insecure_secret_change_me") {
    throw new Error("Production requires a unique JWT_SECRET_TOKEN of at least 32 characters");
  }
  if (env.DONOR_DOCUMENT_KEY.length < 32) {
    throw new Error("Production requires a unique DONOR_DOCUMENT_KEY of at least 32 characters");
  }
}
