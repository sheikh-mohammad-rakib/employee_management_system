import crypto from "crypto"

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 10)

/**
 * Generates a 6-digit numeric OTP string.
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Returns a Date object OTP_EXPIRY_MINUTES from now.
 */
export function getOtpExpiry(): Date {
  const expiry = new Date()
  expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES)
  return expiry
}
