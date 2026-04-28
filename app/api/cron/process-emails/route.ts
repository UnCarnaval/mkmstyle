import { processEmailQueue } from "@/lib/email-queue"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET() {
  try {
    console.log("[v0] Starting email queue processing...")
    const result = await processEmailQueue()
    console.log("[v0] Email queue processed:", result)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error("[v0] Error processing email queue:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
