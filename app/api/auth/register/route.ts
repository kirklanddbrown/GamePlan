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
    const { email, password, name, team } = await request.json()

    if (users.has(email)) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, hash this password
      name,
      team,
    }

    users.set(email, newUser)

    // Create session token
    const sessionToken = `session_${newUser.id}_${Date.now()}`

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
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        team: newUser.team,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
