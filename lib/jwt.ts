import { SignJWT, jwtVerify } from "jose"
import type { JwtPayload } from "@/types"

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d"

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}
