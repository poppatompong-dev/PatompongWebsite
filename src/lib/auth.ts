import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "fallback-secret-change-me-in-production"
);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  bcrypt.hashSync("admin123", 10); // Default dev password — MUST be overridden in .env.local

const SESSION_COOKIE = "admin_session";
const SESSION_DURATION = 60 * 60 * 2; // 2 hours

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (username !== ADMIN_USERNAME) return false;
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
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
