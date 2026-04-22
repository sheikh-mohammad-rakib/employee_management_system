import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { generateOtp, getOtpExpiry } from "@/lib/otp"

const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// POST /api/password/send-otp
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = sendOtpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with that email" },
        { status: 404 }
      )
    }

    const otp = generateOtp()
    const expiresAt = getOtpExpiry()

    await prisma.otpRecord.create({
      data: { userId: user.id, otp, expiresAt },
    })

    // In production: send via email (nodemailer). For now, return in response.
    return NextResponse.json(
      { success: true, data: { otp, message: "OTP generated (dev mode)" } },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
