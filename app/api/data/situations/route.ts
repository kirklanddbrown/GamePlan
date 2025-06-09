import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Simple in-memory storage for demo
const situationData = new Map<string, any[]>()

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

  const situations = situationData.get(userId) || [
    {
      id: "1",
      name: "1st & 10",
      down: 1,
      distance: 10,
      fieldPosition: "Own 25",
      description: "Standard first down situation",
    },
    {
      id: "2",
      name: "3rd & Short",
      down: 3,
      distance: 3,
      fieldPosition: "Midfield",
      description: "Third down conversion opportunity",
    },
  ]

  return NextResponse.json({ situations })
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request)

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const { situations } = await request.json()
    situationData.set(userId, situations)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
