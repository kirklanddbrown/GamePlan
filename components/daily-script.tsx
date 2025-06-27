"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, Target, Users } from "lucide-react"

interface ScriptItem {
  id: string
  time: string
  period: string
  focus: string
  plays: string[]
  notes: string
  personnel: string
}

export function DailyScript() {
  const [scriptItems, setScriptItems] = useState<ScriptItem[]>([
    {
      id: "1",
      time: "15",
      period: "Individual",
      focus: "Route Running",
      plays: ["Comeback", "Out Route", "Slant"],
      notes: "Focus on footwork and timing",
      personnel: "WR/DB",
    },
    {
      id: "2",
      time: "20",
      period: "7v7",
      focus: "3rd Down",
      plays: ["Stick Concept", "Smash", "Flood"],
      notes: "Situational awareness",
      personnel: "11 Personnel",
    },
    {
      id: "3",
      time: "25",
      period: "Team",
      focus: "Red Zone",
      plays: ["Fade", "Slant Flat", "Power O"],
      notes: "Goal line situations",
      personnel: "All",
    },
  ])

  const [newItem, setNewItem] = useState<Partial<ScriptItem>>({
    time: "",
    period: "",
    focus: "",
    plays: [],
    notes: "",
    personnel: "",
  })

  const addScriptItem = () => {
    if (newItem.time && newItem.period && newItem.focus) {
      const item: ScriptItem = {
        id: Date.now().toString(),
        time: newItem.time || "",
        period: newItem.period || "",
        focus: newItem.focus || "",
        plays: newItem.plays || [],
        notes: newItem.notes || "",
        personnel: newItem.personnel || "",
      }
      setScriptItems([...scriptItems, item])
      setNewItem({
        time: "",
        period: "",
        focus: "",
        plays: [],
        notes: "",
        personnel: "",
      })
    }
  }

  const totalTime = scriptItems.reduce((sum, item) => sum + Number.parseInt(item.time || "0"), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Daily Practice Script</h2>
          <p className="text-sm text-gray-600">Total Practice Time: {totalTime} minutes</p>
        </div>
        <Button onClick={addScriptItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add Period
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Time (min)</label>
              <Input
                type="number"
                value={newItem.time}
                onChange={(e) => setNewItem((prev) => ({ ...prev, time: e.target.value }))}
                placeholder="15"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Period Type</label>
              <Select
                value={newItem.period}
                onValueChange={(value) => setNewItem((prev) => ({ ...prev, period: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Position">Position</SelectItem>
                  <SelectItem value="7v7">7v7</SelectItem>
                  <SelectItem value="Team">Team</SelectItem>
                  <SelectItem value="Special Teams">Special Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Focus</label>
              <Input
                value={newItem.focus}
                onChange={(e) => setNewItem((prev) => ({ ...prev, focus: e.target.value }))}
                placeholder="e.g., Red Zone, 3rd Down"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Personnel</label>
              <Select
                value={newItem.personnel}
                onValueChange={(value) => setNewItem((prev) => ({ ...prev, personnel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Personnel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Offense">Offense</SelectItem>
                  <SelectItem value="Defense">Defense</SelectItem>
                  <SelectItem value="11 Personnel">11 Personnel</SelectItem>
                  <SelectItem value="12 Personnel">12 Personnel</SelectItem>
                  <SelectItem value="WR/DB">WR/DB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={newItem.notes}
              onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or coaching points"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {scriptItems.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{item.time} min</span>
                  </div>
                  <Badge variant="outline">{item.period}</Badge>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{item.focus}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{item.personnel}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">Period {index + 1}</span>
              </div>

              {item.plays.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {item.plays.map((play, playIndex) => (
                      <Badge key={playIndex} variant="secondary" className="text-xs">
                        {play}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.notes && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">{item.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Practice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalTime}</div>
              <div className="text-sm text-blue-600">Total Minutes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{scriptItems.length}</div>
              <div className="text-sm text-green-600">Periods</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {scriptItems.filter((item) => item.period === "Team").length}
              </div>
              <div className="text-sm text-purple-600">Team Periods</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {
                  scriptItems.filter((item) => item.focus.includes("Red Zone") || item.focus.includes("3rd Down"))
                    .length
                }
              </div>
              <div className="text-sm text-orange-600">Situational</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
