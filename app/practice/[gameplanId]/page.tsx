"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Plus, Printer, Save, Edit, ArrowLeft } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"

interface PracticePeriod {
  id: string
  name: string
  duration: number
  focus: string
  plays: string[]
  notes: string
}

interface GamePlan {
  id: string
  opponent: string
  date: string
}

export default function PracticeScript({ params }: { params: { gameplanId: string } }) {
  // Mock game plan data - in real app, this would be fetched based on gameplanId
  const [gamePlan] = useState<GamePlan>({
    id: params.gameplanId,
    opponent: params.gameplanId === "1" ? "Eagles" : "Patriots",
    date: params.gameplanId === "1" ? "2024-01-15" : "2024-01-08",
  })

  const [practicePeriods, setPracticePeriods] = useState<PracticePeriod[]>([
    {
      id: "1",
      name: "Individual Drills",
      duration: 15,
      focus: "Fundamentals",
      plays: [],
      notes: "Focus on proper stance and footwork for Eagles game",
    },
    {
      id: "2",
      name: "7 on 7",
      duration: 20,
      focus: "Passing Game",
      plays: ["Smash Concept", "Four Verts", "Slants"],
      notes: `Work on timing vs Eagles Cover 2 defense`,
    },
    {
      id: "3",
      name: "Team Period",
      duration: 25,
      focus: "Full Team",
      plays: ["Power O", "Inside Zone", "Play Action"],
      notes: "Full speed execution - prepare for Eagles front 7",
    },
  ])

  const [newPeriod, setNewPeriod] = useState<Partial<PracticePeriod>>({})
  const [isAddingPeriod, setIsAddingPeriod] = useState(false)

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
            <h2 className="text-3xl font-bold tracking-tight">Practice Script</h2>
            <p className="text-sm text-muted-foreground">
              vs {gamePlan.opponent} • {new Date(gamePlan.date).toLocaleDateString()}
            </p>
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

      {/* Practice Overview */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Game Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">vs {gamePlan.opponent}</div>
            <p className="text-xs text-muted-foreground">Opponent preparation</p>
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
                  placeholder="e.g., Team Period"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newPeriod.duration || ""}
                  onChange={(e) => setNewPeriod({ ...newPeriod, duration: Number.parseInt(e.target.value) })}
                  placeholder="20"
                />
              </div>
            </div>
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newPeriod.notes || ""}
                onChange={(e) => setNewPeriod({ ...newPeriod, notes: e.target.value })}
                placeholder={`Additional notes for ${gamePlan.opponent} preparation...`}
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
          Add Period
        </Button>
      )}

      {/* Practice Periods */}
      <div className="space-y-4">
        {practicePeriods.map((period, index) => (
          <Card key={period.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <span>{period.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {period.duration} minutes • Focus: {period.focus} • vs {gamePlan.opponent}
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
                    Notes:
                  </Label>
                  <Textarea
                    id={`notes-${period.id}`}
                    value={period.notes}
                    onChange={(e) => updatePeriodNotes(period.id, e.target.value)}
                    placeholder={`Add notes for this period vs ${gamePlan.opponent}...`}
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
