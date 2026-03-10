import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

// ==================== Configuration ====================
// All secrets MUST be set via environment variables in production.
// Fallback values are for local development ONLY.

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "dev-only-secret-CHANGE-IN-PRODUCTION-32chars"
);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  bcrypt.hashSync("admin123", 10); // Dev-only default — OVERRIDE in .env.local

// Secondary admin — also configurable via env
const SECONDARY_ADMIN_USERNAME = process.env.SECONDARY_ADMIN_USERNAME || "pop";
const SECONDARY_ADMIN_PASSWORD_HASH =
  process.env.SECONDARY_ADMIN_PASSWORD_HASH ||
  "$2b$10$2QGsgT0ag0WagTYPqnMuk.glbT10BUU9f/ICsHzsiPZn0g3sXOI32";

const SESSION_COOKIE = "admin_session";
const SESSION_DURATION = 60 * 60 * 2; // 2 hours

// ==================== Authentication ====================

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  // Constant-time comparison via bcrypt (prevents timing attacks)
  if (username === ADMIN_USERNAME) {
    return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
  }
  if (username === SECONDARY_ADMIN_USERNAME) {
    return bcrypt.compareSync(password, SECONDARY_ADMIN_PASSWORD_HASH);
  }
  // Run a dummy compare to prevent username enumeration via timing
  bcrypt.compareSync(password, "$2b$10$dummyhashfortimingequalitycheckx");
  return false;
}

export async function createSession(username?: string): Promise<string> {
  const token = await new SignJWT({
    role: "admin",
    sub: username || "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .setJti(crypto.randomUUID()) // Unique token ID for revocation support
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return false;
  return verifySession(session.value);
}

export { SESSION_COOKIE, SESSION_DURATION };
