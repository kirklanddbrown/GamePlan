"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Users, FileText, Play, Target } from "lucide-react"
import { PlayScripts } from "./play-scripts"
import type { Week, Situation, Play as PlayType } from "../page"
// Import the GamePlan component
import { GamePlan } from "./game-plan"
// Import the EnhancedCallSheet component
import { EnhancedCallSheet } from "./enhanced-call-sheet"

// Update the WeekDetailProps interface to include customPlayTypes
interface WeekDetailProps {
  week: Week
  situations: Situation[]
  allPlays: PlayType[]
  onBack: () => void
  onUpdateWeek: (week: Week) => void
  customPlayTypes: string[]
  setCustomPlayTypes: (types: string[]) => void
}

// Update the component signature
export function WeekDetail({
  week,
  situations,
  allPlays,
  onBack,
  onUpdateWeek,
  customPlayTypes,
  setCustomPlayTypes,
}: WeekDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getWeekStatus = (week: Week) => {
    const gameDate = new Date(week.date)
    const today = new Date()
    const diffTime = gameDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: "completed", color: "bg-gray-100 text-gray-800" }
    if (diffDays === 0) return { status: "game day", color: "bg-red-100 text-red-800" }
    if (diffDays <= 7) return { status: `${diffDays} days`, color: "bg-orange-100 text-orange-800" }
    return { status: `${diffDays} days`, color: "bg-green-100 text-green-800" }
  }

  const weekStatus = getWeekStatus(week)

  // Get plays that are assigned to this week, or all plays if none assigned
  const weekPlays = week.weekPlays.length > 0 ? week.weekPlays : allPlays

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-blue-600" />
                <h1 className="text-4xl font-bold text-gray-900">vs {week.opponent}</h1>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatDate(week.date)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {week.location}
                </div>
                <Badge className={weekStatus.color}>{weekStatus.status}</Badge>
              </div>
              {week.notes && <p className="text-gray-700 mt-3 max-w-2xl">{week.notes}</p>}
            </div>
          </div>
        </div>

        {/* Week Content */}
        <Tabs defaultValue="gameplan" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="gameplan" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Game Plan
            </TabsTrigger>
            <TabsTrigger value="scripts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Play Scripts
            </TabsTrigger>
            <TabsTrigger value="callsheet" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Call Sheet
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gameplan">
            <Card>
              <CardHeader>
                <CardTitle>Game Plan for {week.opponent}</CardTitle>
                <p className="text-gray-600">
                  Select situations and create plays specifically for this week's matchup against {week.opponent}.
                </p>
              </CardHeader>
              <CardContent>
                <GamePlan
                  week={week}
                  situations={situations}
                  allPlays={allPlays}
                  onUpdateWeek={onUpdateWeek}
                  customPlayTypes={customPlayTypes}
                  setCustomPlayTypes={setCustomPlayTypes}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scripts">
            <Card>
              <CardHeader>
                <CardTitle>Play Scripts for {week.opponent}</CardTitle>
                <p className="text-gray-600">
                  Create and manage play scripts for specific game situations against {week.opponent}.
                </p>
              </CardHeader>
              <CardContent>
                <PlayScripts week={week} situations={situations} allPlays={allPlays} onUpdateWeek={onUpdateWeek} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="callsheet">
            <Card>
              <CardHeader>
                <CardTitle>Call Sheet - {week.opponent}</CardTitle>
                <p className="text-gray-600">
                  Game day call sheet with editing capabilities for the matchup against {week.opponent}.
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedCallSheet
                  week={week}
                  situations={situations}
                  onUpdateWeek={onUpdateWeek}
                  customPlayTypes={customPlayTypes}
                  setCustomPlayTypes={setCustomPlayTypes}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
