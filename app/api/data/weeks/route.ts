import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Simple in-memory storage for demo - in production, use a real database
const weekData = new Map<string, any[]>()

function getUserId(request: NextRequest): string | null {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) return null

  // Extract user ID from session token (simplified)
  return sessionToken.split("_")[1]
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request)

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const weeks = weekData.get(userId) || []
  return NextResponse.json({ weeks })
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request)

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { weeks } = await request.json()
    weekData.set(userId, weeks)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
