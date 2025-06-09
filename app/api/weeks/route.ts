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

  // Get weeks with their play scripts
  const { data: weeks, error: weeksError } = await supabase
    .from("weeks")
    .select(`
      *,
      play_scripts (*)
    `)
    .eq("user_id", user.id)
    .order("game_date", { ascending: true })

  if (weeksError) {
    return NextResponse.json({ error: weeksError.message }, { status: 500 })
  }

  // Get week plays for each week
  const weeksWithPlays = await Promise.all(
    weeks.map(async (week) => {
      const { data: weekPlays } = await supabase
        .from("week_plays")
        .select(`
          play_id,
          plays (*)
        `)
        .eq("week_id", week.id)

      const plays =
        weekPlays?.map((wp) => ({
          id: wp.plays.id,
          situationId: wp.plays.situation_id,
          name: wp.plays.name,
          formation: wp.plays.formation,
          playType: wp.plays.play_type,
          description: wp.plays.description || "",
          personnel: wp.plays.personnel || "",
          tags: wp.plays.tags || [],
          notes: wp.plays.notes || "",
          success: wp.plays.success,
        })) || []

      return {
        id: week.id,
        opponent: week.opponent,
        date: week.game_date,
        location: week.location,
        notes: week.notes,
        selectedSituations: week.selected_situations || [],
        createdAt: week.created_at,
        playScripts: week.play_scripts.map((script: any) => ({
          id: script.id,
          weekId: script.week_id,
          name: script.name,
          description: script.description,
          plays: script.play_ids || [],
          situationId: script.situation_id,
          createdAt: script.created_at,
          situationsOrder: script.situations_order || [],
          playOrders: script.play_orders || {},
        })),
        weekPlays: plays,
      }
    }),
  )

  return NextResponse.json({ weeks: weeksWithPlays })
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
  const { weeks } = body

  // This is a simplified version - in production, you'd want more granular updates
  // Delete existing weeks and related data
  await supabase.from("weeks").delete().eq("user_id", user.id)

  if (weeks.length > 0) {
    for (const week of weeks) {
      // Insert week
      const { data: insertedWeek, error: weekError } = await supabase
        .from("weeks")
        .insert({
          id: week.id,
          user_id: user.id,
          opponent: week.opponent,
          game_date: week.date,
          location: week.location,
          notes: week.notes,
          selected_situations: week.selectedSituations || [],
        })
        .select()
        .single()

      if (weekError) {
        return NextResponse.json({ error: weekError.message }, { status: 500 })
      }

      // Insert play scripts
      if (week.playScripts && week.playScripts.length > 0) {
        const scripts = week.playScripts.map((script: any) => ({
          id: script.id,
          user_id: user.id,
          week_id: week.id,
          name: script.name,
          description: script.description,
          situation_id: script.situationId,
          play_ids: script.plays || [],
          situations_order: script.situationsOrder || [],
          play_orders: script.playOrders || {},
        }))

        await supabase.from("play_scripts").insert(scripts)
      }

      // Insert week plays
      if (week.weekPlays && week.weekPlays.length > 0) {
        const weekPlays = week.weekPlays.map((play: any) => ({
          user_id: user.id,
          week_id: week.id,
          play_id: play.id,
        }))

        await supabase.from("week_plays").insert(weekPlays)
      }
    }
  }

  return NextResponse.json({ success: true })
}
