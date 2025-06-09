import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Simple in-memory storage for demo - in production, use a real database
const users = new Map([
  [
    "coach@example.com",
    {
      id: "1",
      email: "coach@example.com",
      password: "password123",
      name: "Coach Smith",
      team: "Eagles",
    },
  ],
  [
    "demo@coach.com",
    {
      id: "2",
      email: "demo@coach.com",
      password: "demo123",
      name: "Demo Coach",
      team: "Demo Team",
    },
  ],
])

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = users.get(email)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session token (in production, use proper JWT)
    const sessionToken = `session_${user.id}_${Date.now()}`

    // Set cookie
    const cookieStore = cookies()
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        team: user.team,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
