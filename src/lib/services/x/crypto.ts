import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

/**
 * Symmetric encryption for X (Twitter) tokens stored in the database. Tokens are
 * encrypted at rest with AES-256-GCM using a key derived from PAYLOAD_SECRET, so
 * a database dump alone never exposes a usable access/refresh token.
 *
 * Ciphertext is tagged with a prefix so the helpers stay idempotent: encrypting
 * an already-encrypted value (or decrypting a legacy plaintext value) is a
 * no-op rather than corrupting the data.
 */
const PREFIX = "enc::";

function getKey(): Buffer {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) {
    throw new Error("PAYLOAD_SECRET is required to encrypt X tokens");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptToken(plain: string): string {
  if (!plain || plain.startsWith(PREFIX)) return plain;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith(PREFIX)) return value; // legacy / plaintext
  const [ivHex, tagHex, dataHex] = value.slice(PREFIX.length).split(":");
  if (!ivHex || !tagHex || !dataHex) return null;
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}
