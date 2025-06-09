import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Simple in-memory storage for demo
const playData = new Map<string, any[]>()

function getUserId(request: NextRequest): string | null {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) return null

  return sessionToken.split("_")[1]
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request)

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const plays = playData.get(userId) || [
    {
      id: "1",
      situationId: "1",
      name: "Power O Right",
      formation: "I-Formation",
      playType: "run",
      description: "Power run to the right side",
      personnel: "21 Personnel",
      tags: ["short-yardage", "goal-line"],
    },
    {
      id: "2",
      situationId: "1",
      name: "Slant Concept",
      formation: "Shotgun 3x1",
      playType: "pass",
      description: "Quick slant routes",
      personnel: "11 Personnel",
      tags: ["quick-game", "high-percentage"],
    },
    {
      id: "3",
      situationId: "2",
      name: "QB Sneak",
      formation: "Under Center",
      playType: "run",
      description: "Quarterback sneak for short yardage",
      personnel: "22 Personnel",
      tags: ["short-yardage", "conversion"],
    },
  ]

  return NextResponse.json({ plays })
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request)

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { plays } = await request.json()
    playData.set(userId, plays)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
