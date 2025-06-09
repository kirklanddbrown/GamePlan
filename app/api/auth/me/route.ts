import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Simple session storage - in production, use proper session management
const sessions = new Map<string, string>()

const users = new Map([
  [
    "1",
    {
      id: "1",
      email: "coach@example.com",
      name: "Coach Smith",
      team: "Eagles",
    },
  ],
  [
    "2",
    {
      id: "2",
      email: "demo@coach.com",
      name: "Demo Coach",
      team: "Demo Team",
    },
  ],
])

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Extract user ID from session token (simplified)
    const userId = sessionToken.split("_")[1]
    const user = users.get(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
