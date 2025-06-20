"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Plus, Printer, Save, Edit, ArrowLeft, Target } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface PracticePeriod {
  id: string
  name: string
  duration: number
  focus: string
  plays: string[]
  notes: string
  installPriority: "high" | "medium" | "low"
}

interface GamePlanData {
  id: string
  sections: Array<{
    id: string
    title: string
    plays: Array<{
      id: string
      name: string
      formation: string
      concept: string
      tags?: string[]
    }>
    priority: "high" | "medium" | "low"
    installStatus: "not-started" | "in-progress" | "completed"
  }>
  totalPlays: number
  opponent: string
  week: string
}

export default function CreatePracticeScript() {
  const searchParams = useSearchParams()
  const gameplanId = searchParams.get("gameplan")
  const gamePlanDataParam = searchParams.get("data")

  const [gamePlanData, setGamePlanData] = useState<GamePlanData | null>(null)
  const [practicePeriods, setPracticePeriods] = useState<PracticePeriod[]>([])
  const [newPeriod, setNewPeriod] = useState<Partial<PracticePeriod>>({})
  const [isAddingPeriod, setIsAddingPeriod] = useState(false)
  const [practiceDate, setPracticeDate] = useState(new Date().toISOString().split("T")[0])
  const [practiceType, setPracticeType] = useState("install")

  useEffect(() => {
    if (gamePlanDataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(gamePlanDataParam))
        setGamePlanData(data)

        // Auto-generate practice periods based on game plan
        const autoPeriods = generatePracticePeriodsFromGamePlan(data)
        setPracticePeriods(autoPeriods)
      } catch (error) {
        console.error("Error parsing game plan data:", error)
      }
    }
  }, [gamePlanDataParam])

  const generatePracticePeriodsFromGamePlan = (data: GamePlanData): PracticePeriod[] => {
    const periods: PracticePeriod[] = []

    // Individual Period
    periods.push({
      id: "individual",
      name: "Individual Drills",
      duration: 15,
      focus: "Fundamentals",
      plays: [],
      notes: `Individual skill work preparing for Week ${data.week} vs ${data.opponent}`,
      installPriority: "medium",
    })

    // Install periods based on game plan sections
    const completedSections = data.sections.filter((s) => s.installStatus === "completed" && s.plays.length > 0)
    const inProgressSections = data.sections.filter((s) => s.installStatus === "in-progress" && s.plays.length > 0)

    // Completed plays review period
    if (completedSections.length > 0) {
      const completedPlays = completedSections.flatMap((s) => s.plays.map((p) => p.name))
      periods.push({
        id: "completed-review",
        name: "Completed Plays Review",
        duration: 20,
        focus: "Review & Polish",
        plays: completedPlays,
        notes: `Review completed plays for Week ${data.week} vs ${data.opponent}: ${completedSections.map((s) => s.title).join(", ")}`,
        installPriority: "medium",
      })
    }

    // 7 on 7 Period
    const passingPlays = data.sections
      .filter((s) =>
        s.plays.some(
          (p) => p.concept.includes("Vertical") || p.concept.includes("Smash") || p.concept.includes("Stick"),
        ),
      )
      .flatMap((s) =>
        s.plays
          .filter((p) => p.concept.includes("Vertical") || p.concept.includes("Smash") || p.concept.includes("Stick"))
          .map((p) => p.name),
      )

    if (passingPlays.length > 0) {
      periods.push({
        id: "seven-on-seven",
        name: "7 on 7 Passing",
        duration: 20,
        focus: "Passing Game",
        plays: passingPlays,
        notes: `Week ${data.week} passing game install vs ${data.opponent} coverage tendencies`,
        installPriority: "medium",
      })
    }

    // Team Period
    const teamPlays = data.sections.flatMap((s) => s.plays.map((p) => p.name)).slice(0, 8) // Limit for team period
    periods.push({
      id: "team-period",
      name: "Team Period",
      duration: 30,
      focus: "Full Team Install",
      plays: teamPlays,
      notes: `Week ${data.week} full team install vs ${data.opponent} - focus on execution and timing`,
      installPriority: "medium",
    })

    // In-progress install if needed
    if (inProgressSections.length > 0) {
      const inProgressPlays = inProgressSections.flatMap((s) => s.plays.map((p) => p.name))
      periods.push({
        id: "in-progress-install",
        name: "New Install Period",
        duration: 25,
        focus: "New Plays",
        plays: inProgressPlays,
        notes: `Week ${data.week} new play install vs ${data.opponent}: ${inProgressSections.map((s) => s.title).join(", ")}`,
        installPriority: "medium",
      })
    }

    return periods
  }

  const totalDuration = practicePeriods.reduce((sum, period) => sum + period.duration, 0)

  const handleAddPeriod = () => {
    if (newPeriod.name && newPeriod.duration && newPeriod.focus) {
      const period: PracticePeriod = {
        id: Date.now().toString(),
        name: newPeriod.name,
        duration: newPeriod.duration,
        focus: newPeriod.focus,
        plays: [],
        notes: newPeriod.notes || "",
        installPriority: (newPeriod.installPriority as "high" | "medium" | "low") || "medium",
      }
      setPracticePeriods([...practicePeriods, period])
      setNewPeriod({})
      setIsAddingPeriod(false)
    }
  }

  const updatePeriodNotes = (id: string, notes: string) => {
    setPracticePeriods((periods) => periods.map((period) => (period.id === id ? { ...period, notes } : period)))
  }

  const handlePrint = () => {
    window.print()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "medium":
        return "border-blue-200 bg-blue-50"
      case "low":
        return "border-green-200 bg-green-50"
      default:
        return ""
    }
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
            <h2 className="text-3xl font-bold tracking-tight">Create Practice Script</h2>
            {gamePlanData && (
              <p className="text-sm text-muted-foreground">
                vs {gamePlanData.opponent} • {gamePlanData.totalPlays} plays in game plan • Auto-generated from game
                plan
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Script
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Script
          </Button>
        </div>
      </div>

      {/* Practice Script Header */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Script Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="practice-date">Practice Date</Label>
            <Input
              id="practice-date"
              type="date"
              value={practiceDate}
              onChange={(e) => setPracticeDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="practice-type">Practice Type</Label>
            <Select value={practiceType} onValueChange={setPracticeType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="install">Install Practice</SelectItem>
                <SelectItem value="review">Review Practice</SelectItem>
                <SelectItem value="walkthrough">Walkthrough</SelectItem>
                <SelectItem value="scrimmage">Scrimmage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Opponent</Label>
            <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
              {gamePlanData?.opponent || "No opponent selected"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practice Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDuration} min</div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Periods</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practicePeriods.length}</div>
            <p className="text-xs text-muted-foreground">Practice segments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plays to Install</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {practicePeriods.reduce((total, period) => total + period.plays.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">From game plan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {practicePeriods.filter((p) => p.installPriority === "medium").length}
            </div>
            <p className="text-xs text-muted-foreground">Priority periods</p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Period */}
      {isAddingPeriod ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="period-name">Period Name</Label>
                <Input
                  id="period-name"
                  value={newPeriod.name || ""}
                  onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
                  placeholder="e.g., Special Teams Period"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newPeriod.duration || ""}
                  onChange={(e) => setNewPeriod({ ...newPeriod, duration: Number.parseInt(e.target.value) })}
                  placeholder="15"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="focus">Focus Area</Label>
                <Select onValueChange={(value) => setNewPeriod({ ...newPeriod, focus: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select focus area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fundamentals">Fundamentals</SelectItem>
                    <SelectItem value="Passing Game">Passing Game</SelectItem>
                    <SelectItem value="Running Game">Running Game</SelectItem>
                    <SelectItem value="Full Team">Full Team</SelectItem>
                    <SelectItem value="Special Teams">Special Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Install Priority</Label>
                <Select
                  onValueChange={(value) =>
                    setNewPeriod({ ...newPeriod, installPriority: value as "high" | "medium" | "low" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newPeriod.notes || ""}
                onChange={(e) => setNewPeriod({ ...newPeriod, notes: e.target.value })}
                placeholder={`Additional notes for this period vs ${gamePlanData?.opponent || "opponent"}...`}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAddPeriod}>Add Period</Button>
              <Button variant="outline" onClick={() => setIsAddingPeriod(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAddingPeriod(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Period
        </Button>
      )}

      {/* Practice Periods */}
      <div className="space-y-4">
        {practicePeriods.map((period, index) => (
          <Card key={period.id} className={getPriorityColor(period.installPriority)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <span>{period.name}</span>
                    <Badge
                      className={
                        period.installPriority === "high"
                          ? "bg-red-500"
                          : period.installPriority === "medium"
                            ? "bg-blue-500"
                            : "bg-green-500"
                      }
                    >
                      {period.installPriority} priority
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {period.duration} minutes • Focus: {period.focus} • {period.plays.length} plays
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {period.plays.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Plays to Install:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {period.plays.map((play, playIndex) => (
                        <Badge key={playIndex} variant="outline">
                          {play}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor={`notes-${period.id}`} className="text-sm font-medium">
                    Coaching Notes:
                  </Label>
                  <Textarea
                    id={`notes-${period.id}`}
                    value={period.notes}
                    onChange={(e) => updatePeriodNotes(period.id, e.target.value)}
                    placeholder={`Add coaching notes for this period vs ${gamePlanData?.opponent || "opponent"}...`}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
