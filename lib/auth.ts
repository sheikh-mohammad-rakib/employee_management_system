import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import type { AuthUser } from "@/types"

const SALT_ROUNDS = 12

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}

/**
 * Reads the access_token cookie and returns the decoded auth user,
 * or null if the token is missing/invalid.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("access_token")?.value
  if (!token) return null
  return await verifyToken(token)
}
