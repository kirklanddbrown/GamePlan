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

  const { data: plays, error } = await supabase
    .from("plays")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform database format to app format
  const transformedPlays = plays.map((play) => ({
    id: play.id,
    situationId: play.situation_id,
    name: play.name,
    formation: play.formation,
    playType: play.play_type,
    description: play.description || "",
    personnel: play.personnel || "",
    tags: play.tags || [],
    notes: play.notes || "",
    success: play.success,
  }))

  return NextResponse.json({ plays: transformedPlays })
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
  const { plays } = body

  // Delete existing plays and insert new ones
  await supabase.from("plays").delete().eq("user_id", user.id)

  if (plays.length > 0) {
    const playsWithUserId = plays.map((play: any) => ({
      id: play.id,
      user_id: user.id,
      situation_id: play.situationId,
      name: play.name,
      formation: play.formation,
      play_type: play.playType,
      description: play.description,
      personnel: play.personnel,
      tags: play.tags || [],
      notes: play.notes,
      success: play.success,
    }))

    const { error } = await supabase.from("plays").insert(playsWithUserId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
