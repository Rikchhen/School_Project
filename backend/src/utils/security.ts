import crypto from "node:crypto";

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function safeEqualHash(value: string, expectedHash: string): boolean {
  const actual = Buffer.from(sha256(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function base32Encode(input: Buffer): string {
  let bits = "";
  for (const byte of input) bits += byte.toString(2).padStart(8, "0");
  let output = "";
  for (let i = 0; i < bits.length; i += 5) output += BASE32[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=|\s/g, "");
  let bits = "";
  for (const char of clean) {
    const value = BASE32.indexOf(char);
    if (value < 0) throw new Error("Invalid base32 secret");
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function verifyTotp(secret: string, code: string, now = Date.now()): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const key = base32Decode(secret);
  const counter = Math.floor(now / 30_000);
  for (let drift = -1; drift <= 1; drift++) {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(counter + drift));
    const digest = crypto.createHmac("sha1", key).update(buffer).digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const value = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
    if (crypto.timingSafeEqual(Buffer.from(code), Buffer.from(String(value).padStart(6, "0")))) return true;
  }
  return false;
}
