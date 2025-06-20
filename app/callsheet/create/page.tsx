"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, Download, Save, ArrowLeft } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getGamePlanData, type GamePlanData } from "@/lib/gameplan-data-store"

interface CallSheetPlay {
  id: string
  name: string
  formation: string
  concept: string
  personnel: string
  tags?: string[]
}

interface CallSheetSection {
  title: string
  plays: CallSheetPlay[]
}

export default function CreateCallSheet() {
  const searchParams = useSearchParams()
  const gameplanId = searchParams.get("gameplan")
  const gamePlanDataParam = searchParams.get("data")

  const [gamePlanData, setGamePlanData] = useState<GamePlanData | null>(null)
  const [callSheetData, setCallSheetData] = useState<Record<string, CallSheetSection>>({})

  // Safe date formatting function
  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) return new Date().toLocaleDateString()
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return new Date().toLocaleDateString()
      }
      return date.toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return new Date().toLocaleDateString()
    }
  }

  useEffect(() => {
    let data: GamePlanData | null = null

    // First try to get data from URL parameter
    if (gamePlanDataParam) {
      try {
        data = JSON.parse(decodeURIComponent(gamePlanDataParam))
        console.log("Loaded game plan data from URL:", data)
      } catch (error) {
        console.error("Error parsing game plan data from URL:", error)
      }
    }

    // If no URL data, try to get from store
    if (!data && gameplanId) {
      data = getGamePlanData(gameplanId)
      console.log("Loaded game plan data from store:", data)
    }

    if (data) {
      setGamePlanData(data)
      // Generate call sheet from actual game plan data
      const autoCallSheet = generateCallSheetFromGamePlan(data)
      setCallSheetData(autoCallSheet)
    } else {
      console.warn("No game plan data found")
    }
  }, [gamePlanDataParam, gameplanId])

  const generateCallSheetFromGamePlan = (data: GamePlanData): Record<string, CallSheetSection> => {
    const callSheet: Record<string, CallSheetSection> = {}

    // Convert game plan sections to call sheet sections
    data.sections.forEach((section) => {
      if (section.plays.length > 0) {
        const callSheetPlays: CallSheetPlay[] = section.plays.map((play) => ({
          id: play.id,
          name: play.name,
          formation: play.formation,
          concept: play.concept,
          personnel: getPersonnelFromFormation(play.formation),
          tags: play.tags,
        }))

        // Use the section ID as the key to maintain consistency
        callSheet[section.id] = {
          title: section.title,
          plays: callSheetPlays,
        }
      } else {
        // Include empty sections to show structure
        callSheet[section.id] = {
          title: section.title,
          plays: [],
        }
      }
    })

    console.log("Generated call sheet from game plan:", callSheet)
    return callSheet
  }

  const getPersonnelFromFormation = (formation: string): string => {
    if (!formation) return "11"

    // Simple mapping - in real app, this would be more sophisticated
    switch (formation.toLowerCase()) {
      case "shotgun":
        return "11"
      case "i-formation":
      case "i-form":
        return "21"
      case "singleback":
        return "11"
      case "pistol":
        return "11"
      case "empty":
        return "10"
      case "trips":
        return "11"
      case "bunch":
        return "11"
      default:
        return "11"
    }
  }

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

  if (!gamePlanData) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <Link href="/gameplan">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Game Plan
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Create Call Sheet</h2>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No game plan data found. Please create a game plan first.</p>
            <Link href="/gameplan">
              <Button className="mt-4">Go to Game Plan Editor</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <Link href="/gameplan">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Game Plan
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create Call Sheet</h2>
            <p className="text-sm text-muted-foreground">
              Week {gamePlanData.week || "N/A"} vs {gamePlanData.opponent || "TBD"} • Generated from game plan •{" "}
              {Object.values(callSheetData).reduce((total, section) => total + section.plays.length, 0)} plays
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
              <CardTitle>Week {gamePlanData.week || "N/A"} Call Sheet</CardTitle>
              <CardDescription>
                vs {gamePlanData.opponent || "TBD"} • {formatDate(gamePlanData.date)} • Generated from Game Plan
              </CardDescription>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Weather: 45°F, Clear</div>
              <div>Wind: 5 mph NW</div>
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
                Personnel Packages - Week {gamePlanData.week || "N/A"} vs {gamePlanData.opponent || "TBD"}
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
                    {section.plays.length} plays for Week {gamePlanData.week || "N/A"} vs{" "}
                    {gamePlanData.opponent || "TBD"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.plays.length > 0 ? (
                      section.plays.map((play) => (
                        <div key={play.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{play.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {play.formation} • {play.concept}
                            </div>
                            {play.tags && play.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {play.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Badge className={getPersonnelColor(play.personnel)}>{play.personnel}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed rounded-lg">
                        No plays assigned for {section.title}
                        <br />
                        <span className="text-xs">Add plays in Game Plan Editor</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {Object.keys(callSheetData).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No sections found in game plan.</p>
                <Link href="/gameplan">
                  <Button className="mt-4">Go to Game Plan Editor</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="defense">
          <Card>
            <CardHeader>
              <CardTitle>
                Week {gamePlanData.week || "N/A"} Defensive Call Sheet vs {gamePlanData.opponent || "TBD"}
              </CardTitle>
              <CardDescription>Defensive strategy for this week</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="special">
          <Card>
            <CardHeader>
              <CardTitle>
                Week {gamePlanData.week || "N/A"} Special Teams Call Sheet vs {gamePlanData.opponent || "TBD"}
              </CardTitle>
              <CardDescription>Special teams strategy for this week</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
