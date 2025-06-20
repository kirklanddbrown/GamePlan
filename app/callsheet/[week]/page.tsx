"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Download, Save, ArrowLeft } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"

interface CallSheetPlay {
  id: string
  name: string
  formation: string
  concept: string
  personnel: string
}

interface CallSheetSection {
  title: string
  plays: CallSheetPlay[]
}

interface GamePlan {
  id: string
  week: number
  opponent: string
  date: string
  location: string
  weather?: string
  wind?: string
}

export default function CallSheetBuilder({ params }: { params: { week: string } }) {
  // Mock game plan data - in real app, this would be fetched based on week
  const [gamePlan] = useState<GamePlan>({
    id: params.week,
    week: Number.parseInt(params.week),
    opponent: getOpponentForWeek(Number.parseInt(params.week)),
    date: getDateForWeek(Number.parseInt(params.week)),
    location: "Home",
    weather: "45°F, Clear",
    wind: "5 mph NW",
  })

  // Replace the getDateForWeek function with this safer version:
  function getDateForWeek(week: number): string {
    try {
      if (!week || isNaN(week) || week < 1) {
        console.warn("Invalid week number:", week)
        return new Date().toISOString().split("T")[0]
      }

      const baseDate = new Date("2024-01-15")
      if (isNaN(baseDate.getTime())) {
        console.error("Invalid base date")
        return new Date().toISOString().split("T")[0]
      }

      baseDate.setDate(baseDate.getDate() + (week - 1) * 7)

      if (isNaN(baseDate.getTime())) {
        console.error("Invalid calculated date for week:", week)
        return new Date().toISOString().split("T")[0]
      }

      return baseDate.toISOString().split("T")[0]
    } catch (error) {
      console.error("Error in getDateForWeek:", error)
      return new Date().toISOString().split("T")[0]
    }
  }

  function getOpponentForWeek(week: number): string {
    if (!week || isNaN(week)) return "TBD"

    const opponents = ["Eagles", "Patriots", "Cowboys", "Giants", "Commanders"]
    return opponents[(week - 1) % opponents.length] || "TBD"
  }

  const [callSheetData] = useState<Record<string, CallSheetSection>>({
    "1st-10": {
      title: "1st & 10",
      plays: [
        { id: "1", name: "Power O", formation: "I-Form", concept: "Power", personnel: "21" },
        { id: "2", name: "Inside Zone", formation: "Shotgun", concept: "Zone", personnel: "11" },
        { id: "3", name: "Play Action", formation: "Singleback", concept: "PA", personnel: "11" },
      ],
    },
    "2nd-long": {
      title: "2nd & Long (7+)",
      plays: [
        { id: "4", name: "Four Verts", formation: "Shotgun", concept: "Vertical", personnel: "11" },
        { id: "5", name: "Comeback", formation: "Shotgun", concept: "Comeback", personnel: "11" },
      ],
    },
    "3rd-short": {
      title: "3rd & Short (1-3)",
      plays: [
        { id: "6", name: "QB Sneak", formation: "Under Center", concept: "Sneak", personnel: "22" },
        { id: "7", name: "Slant", formation: "Shotgun", concept: "Slant", personnel: "11" },
      ],
    },
    "3rd-medium": {
      title: "3rd & Medium (4-6)",
      plays: [
        { id: "8", name: "Smash", formation: "Singleback", concept: "Smash", personnel: "11" },
        { id: "9", name: "Stick", formation: "Shotgun", concept: "Stick", personnel: "11" },
      ],
    },
    "3rd-long": {
      title: "3rd & Long (7+)",
      plays: [
        { id: "10", name: "Four Verts", formation: "Shotgun", concept: "Vertical", personnel: "10" },
        { id: "11", name: "Flood", formation: "Shotgun", concept: "Flood", personnel: "11" },
      ],
    },
    "red-zone": {
      title: "Red Zone",
      plays: [
        { id: "12", name: "Fade", formation: "Shotgun", concept: "Fade", personnel: "11" },
        { id: "13", name: "Power O", formation: "I-Form", concept: "Power", personnel: "21" },
      ],
    },
    "goal-line": {
      title: "Goal Line",
      plays: [
        { id: "14", name: "QB Sneak", formation: "Under Center", concept: "Sneak", personnel: "22" },
        { id: "15", name: "Fade", formation: "Shotgun", concept: "Fade", personnel: "13" },
      ],
    },
    "two-minute": {
      title: "2 Minute Drill",
      plays: [
        { id: "16", name: "Slant", formation: "Shotgun", concept: "Slant", personnel: "11" },
        { id: "17", name: "Out", formation: "Shotgun", concept: "Out", personnel: "11" },
        { id: "18", name: "Spike", formation: "Shotgun", concept: "Spike", personnel: "11" },
      ],
    },
  })

  const handlePrint = () => {
    window.print()
  }

  const getPersonnelColor = (personnel: string) => {
    switch (personnel) {
      case "11":
        return "bg-blue-500"
      case "10":
        return "bg-green-500"
      case "21":
        return "bg-orange-500"
      case "22":
        return "bg-red-500"
      case "13":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Call Sheet Builder</h2>
            <p className="text-sm text-muted-foreground">
              Week {gamePlan.week} vs {gamePlan.opponent} • {new Date(gamePlan.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Call Sheet
          </Button>
        </div>
      </div>

      {/* Call Sheet Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Week {gamePlan.week} Call Sheet</CardTitle>
              <CardDescription>
                vs {gamePlan.opponent} • {new Date(gamePlan.date).toLocaleDateString()} • {gamePlan.location}
              </CardDescription>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Weather: {gamePlan.weather}</div>
              <div>Wind: {gamePlan.wind}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="offense" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="offense">Offense</TabsTrigger>
          <TabsTrigger value="defense">Defense</TabsTrigger>
          <TabsTrigger value="special">Special Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="offense" className="space-y-6">
          {/* Personnel Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Personnel Packages - Week {gamePlan.week} vs {gamePlan.opponent}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-500">11 - 1 RB, 1 TE, 3 WR</Badge>
                <Badge className="bg-green-500">10 - 1 RB, 0 TE, 4 WR</Badge>
                <Badge className="bg-orange-500">21 - 2 RB, 1 TE, 2 WR</Badge>
                <Badge className="bg-red-500">22 - 2 RB, 2 TE, 1 WR</Badge>
                <Badge className="bg-purple-500">13 - 1 RB, 3 TE, 1 WR</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Call Sheet Sections */}
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(callSheetData).map(([key, section]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>
                    {section.plays.length} plays for Week {gamePlan.week} vs {gamePlan.opponent}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.plays.map((play) => (
                      <div key={play.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{play.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {play.formation} • {play.concept}
                          </div>
                        </div>
                        <Badge className={getPersonnelColor(play.personnel)}>{play.personnel}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="defense">
          <Card>
            <CardHeader>
              <CardTitle>
                Week {gamePlan.week} Defensive Call Sheet vs {gamePlan.opponent}
              </CardTitle>
              <CardDescription>Defensive strategy for this week</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="special">
          <Card>
            <CardHeader>
              <CardTitle>
                Week {gamePlan.week} Special Teams Call Sheet vs {gamePlan.opponent}
              </CardTitle>
              <CardDescription>Special teams strategy for this week</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
