"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useDailyScripts } from "@/contexts/daily-script-context"
import { useGamePlans } from "@/contexts/game-plan-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Clock, Target, Users, Save } from "lucide-react"

interface DailyScriptEditorProps {
  scriptId: string
}

export function DailyScriptEditor({ scriptId }: DailyScriptEditorProps) {
  const { dailyScripts, updateDailyScript } = useDailyScripts()
  const { gamePlans } = useGamePlans()
  const { toast } = useToast()

  const script = dailyScripts.find((s) => s.id === scriptId)
  const gamePlan = script ? gamePlans.find((p) => p.id === script.gamePlanId) : null

  const [newPeriod, setNewPeriod] = useState({
    time: "",
    name: "",
    focus: "",
    personnel: "",
    notes: "",
    situationId: "",
  })

  const [isAddingPeriod, setIsAddingPeriod] = useState(false)

  if (!script || !gamePlan) {
    return <div>Script or game plan not found</div>
  }

  const handleAddPeriod = () => {
    if (!newPeriod.time || !newPeriod.name || !newPeriod.focus) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const situation = newPeriod.situationId ? gamePlan.situations.find((s) => s.id === newPeriod.situationId) : null

    const period = {
      id: `period-${Date.now()}`,
      time: newPeriod.time,
      name: newPeriod.name,
      focus: newPeriod.focus,
      personnel: newPeriod.personnel,
      notes: newPeriod.notes,
      situationId: newPeriod.situationId,
      situationName: situation?.name || "",
      plays: situation?.plays || [],
    }

    updateDailyScript(scriptId, {
      ...script,
      periods: [...script.periods, period],
    })

    setNewPeriod({
      time: "",
      name: "",
      focus: "",
      personnel: "",
      notes: "",
      situationId: "",
    })

    setIsAddingPeriod(false)

    toast({
      title: "Period added",
      description: `Period "${newPeriod.name}" has been added to the script`,
    })
  }

  const handleDeletePeriod = (periodId: string) => {
    updateDailyScript(scriptId, {
      ...script,
      periods: script.periods.filter((period) => period.id !== periodId),
    })

    toast({
      title: "Period deleted",
      description: "The period has been removed from the script",
    })
  }

  const totalTime = script.periods.reduce((sum, period) => sum + Number(period.time), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Editing Script: {script.title}</h2>
          <p className="text-sm text-gray-600">
            {new Date(script.date).toLocaleDateString()} • vs {script.opponent} • Total Time: {totalTime} minutes
          </p>
        </div>
        <Dialog open={isAddingPeriod} onOpenChange={setIsAddingPeriod}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Period
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Practice Period</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Time (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    placeholder="e.g. 15"
                    value={newPeriod.time}
                    onChange={(e) => setNewPeriod({ ...newPeriod, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Period Name</Label>
                  <Select value={newPeriod.name} onValueChange={(value) => setNewPeriod({ ...newPeriod, name: value })}>
                    <SelectTrigger id="name">
                      <SelectValue placeholder="Select period type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Team">Team</SelectItem>
                      <SelectItem value="7v7">7v7</SelectItem>
                      <SelectItem value="Special Teams">Special Teams</SelectItem>
                      <SelectItem value="Walkthrough">Walkthrough</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="focus">Focus</Label>
                <Input
                  id="focus"
                  placeholder="e.g. Red Zone, 3rd Down"
                  value={newPeriod.focus}
                  onChange={(e) => setNewPeriod({ ...newPeriod, focus: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personnel">Personnel</Label>
                <Select
                  value={newPeriod.personnel}
                  onValueChange={(value) => setNewPeriod({ ...newPeriod, personnel: value })}
                >
                  <SelectTrigger id="personnel">
                    <SelectValue placeholder="Select personnel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Offense">Offense</SelectItem>
                    <SelectItem value="Defense">Defense</SelectItem>
                    <SelectItem value="Special Teams">Special Teams</SelectItem>
                    <SelectItem value="QBs">Quarterbacks</SelectItem>
                    <SelectItem value="WR/DB">WR/DB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="situation">Game Plan Situation (Optional)</Label>
                <Select
                  value={newPeriod.situationId}
                  onValueChange={(value) => setNewPeriod({ ...newPeriod, situationId: value })}
                >
                  <SelectTrigger id="situation">
                    <SelectValue placeholder="Link to game plan situation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No situation link</SelectItem>
                    {gamePlan.situations.map((situation) => (
                      <SelectItem key={situation.id} value={situation.id}>
                        {situation.name} ({situation.plays.length} plays)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes or coaching points"
                  value={newPeriod.notes}
                  onChange={(e) => setNewPeriod({ ...newPeriod, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleAddPeriod} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Add Period
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {script.periods.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600">No periods added yet</h3>
            <p className="text-gray-500 mt-2">Add practice periods to build your daily script</p>
            <Button className="mt-4" onClick={() => setIsAddingPeriod(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Period
            </Button>
          </div>
        ) : (
          script.periods.map((period, index) => (
            <Card key={period.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{period.time} min</span>
                    </div>
                    <Badge variant="outline">{period.name}</Badge>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{period.focus}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{period.personnel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Period {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePeriod(period.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {period.situationId && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-blue-800">Linked Situation: {period.situationName}</h4>
                      <Badge variant="secondary" className="bg-blue-100">
                        {period.plays.length} plays
                      </Badge>
                    </div>
                    {period.plays.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-blue-100">
                              <th className="p-1 text-left">#</th>
                              <th className="p-1 text-left">Formation</th>
                              <th className="p-1 text-left">Play</th>
                              <th className="p-1 text-left">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {period.plays.slice(0, 3).map((play, i) => (
                              <tr key={play.id} className="border-b border-blue-100">
                                <td className="p-1">{play.number || i + 1}</td>
                                <td className="p-1">{play.formation}</td>
                                <td className="p-1">{play.motion}</td>
                                <td className="p-1 truncate max-w-xs">{play.notes}</td>
                              </tr>
                            ))}
                            {period.plays.length > 3 && (
                              <tr>
                                <td colSpan={4} className="p-1 text-center text-blue-600">
                                  +{period.plays.length - 3} more plays
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {period.notes && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">{period.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
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
              <div className="text-2xl font-bold text-green-600">{script.periods.length}</div>
              <div className="text-sm text-green-600">Periods</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {script.periods.filter((period) => period.name === "Team").length}
              </div>
              <div className="text-sm text-purple-600">Team Periods</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {script.periods.filter((period) => period.situationId).length}
              </div>
              <div className="text-sm text-orange-600">Linked Situations</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
