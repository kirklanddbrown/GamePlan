import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: situations, error } = await supabase
    .from("situations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ situations })
}

export async function POST(request: Request) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { situations } = body

  // Delete existing situations and insert new ones
  await supabase.from("situations").delete().eq("user_id", user.id)

  if (situations.length > 0) {
    const situationsWithUserId = situations.map((situation: any) => ({
      ...situation,
      user_id: user.id,
      field_position: situation.fieldPosition,
      time_remaining: situation.timeRemaining,
    }))

    const { error } = await supabase.from("situations").insert(situationsWithUserId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
