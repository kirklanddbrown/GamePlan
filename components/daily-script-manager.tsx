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
import { Plus, Trash2, Clock, Target, Users, Save, Calendar } from "lucide-react"

interface DailyScriptManagerProps {
  gamePlanId: string
}

export function DailyScriptManager({ gamePlanId }: DailyScriptManagerProps) {
  const { dailyScripts, addDailyScript, updateDailyScript, deleteDailyScript } = useDailyScripts()
  const { gamePlans } = useGamePlans()
  const { toast } = useToast()

  const gamePlan = gamePlans.find((plan) => plan.id === gamePlanId)
  const scriptsForThisGamePlan = dailyScripts.filter((script) => script.gamePlanId === gamePlanId)

  const [newScript, setNewScript] = useState({
    title: "",
    date: "",
    description: "",
  })

  const [selectedScript, setSelectedScript] = useState<string | null>(null)
  const [isCreatingScript, setIsCreatingScript] = useState(false)

  const [newPeriod, setNewPeriod] = useState({
    time: "",
    name: "",
    focus: "",
    personnel: "",
    notes: "",
    situationId: "",
  })

  const [isAddingPeriod, setIsAddingPeriod] = useState(false)

  if (!gamePlan) {
    return <div>Game plan not found</div>
  }

  const handleCreateScript = () => {
    if (!newScript.title || !newScript.date) {
      toast({
        title: "Missing information",
        description: "Please fill in title and date",
        variant: "destructive",
      })
      return
    }

    const id = `script-${Date.now()}`

    addDailyScript({
      id,
      title: newScript.title,
      date: newScript.date,
      gamePlanId: gamePlanId,
      description: newScript.description,
      opponent: gamePlan.opponent,
      periods: [],
    })

    setNewScript({
      title: "",
      date: "",
      description: "",
    })

    setIsCreatingScript(false)
    setSelectedScript(id)

    toast({
      title: "Daily script created",
      description: `Daily script "${newScript.title}" has been created`,
    })
  }

  const handleAddPeriod = (scriptId: string) => {
    if (!newPeriod.time || !newPeriod.name || !newPeriod.focus) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const script = scriptsForThisGamePlan.find((s) => s.id === scriptId)
    if (!script) return

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
      // Don't store static plays - we'll get them dynamically from the situation
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

  const handleDeleteScript = (id: string) => {
    deleteDailyScript(id)
    if (selectedScript === id) {
      setSelectedScript(null)
    }

    toast({
      title: "Daily script deleted",
      description: "The daily script has been deleted",
    })
  }

  const selectedScriptData = scriptsForThisGamePlan.find((s) => s.id === selectedScript)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Daily Scripts for Week {gamePlan.week} vs {gamePlan.opponent}
        </h2>
        <Dialog open={isCreatingScript} onOpenChange={setIsCreatingScript}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Daily Script
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Daily Script</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Tuesday Practice - Red Zone Focus"
                  value={newScript.title}
                  onChange={(e) => setNewScript({ ...newScript, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newScript.date}
                  onChange={(e) => setNewScript({ ...newScript, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of practice focus"
                  value={newScript.description}
                  onChange={(e) => setNewScript({ ...newScript, description: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateScript} className="w-full">
                Create Daily Script
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scriptsForThisGamePlan.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No daily scripts yet</h3>
            <p className="text-gray-500 mt-2">Create your first daily script for this game plan</p>
            <Button className="mt-4" onClick={() => setIsCreatingScript(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Daily Script
            </Button>
          </div>
        ) : (
          <>
            {scriptsForThisGamePlan.map((script) => (
              <Card key={script.id} className={selectedScript === script.id ? "border-blue-500 shadow-md" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span>{script.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteScript(script.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(script.date).toLocaleDateString()}</span>
                  </div>
                  {script.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{script.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-blue-50">
                      {script.periods.length} Periods
                    </Badge>
                    <Badge variant="outline" className="bg-green-50">
                      {script.periods.reduce((sum, period) => sum + Number(period.time), 0)} min
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedScript(script.id)} className="w-full">
                    {selectedScript === script.id ? "Editing" : "Edit Script"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {selectedScriptData && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Editing: {selectedScriptData.title}</span>
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
                          <Select
                            value={newPeriod.name}
                            onValueChange={(value) => setNewPeriod({ ...newPeriod, name: value })}
                          >
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
                        <Label htmlFor="situation">Link to Situation (Optional)</Label>
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
                      <Button onClick={() => handleAddPeriod(selectedScriptData.id)} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Add Period
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedScriptData.periods.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-600">No periods added yet</h3>
                    <p className="text-gray-500 mt-2">Add practice periods to build your daily script</p>
                    <Button className="mt-4" onClick={() => setIsAddingPeriod(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Period
                    </Button>
                  </div>
                ) : (
                  selectedScriptData.periods.map((period, index) => {
                    // Get real-time plays from the current situation
                    const linkedSituation = period.situationId
                      ? gamePlan.situations.find((s) => s.id === period.situationId)
                      : null
                    const currentPlays = linkedSituation ? linkedSituation.plays : []

                    return (
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
                            <span className="text-sm text-gray-500">Period {index + 1}</span>
                          </div>

                          {period.situationId && linkedSituation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-blue-800">Linked: {linkedSituation.name}</h4>
                                <Badge variant="secondary" className="bg-blue-100">
                                  {currentPlays.length} plays
                                </Badge>
                              </div>
                              {currentPlays.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-blue-100">
                                        <th className="p-1 text-left">#</th>
                                        <th className="p-1 text-left">Formation</th>
                                        <th className="p-1 text-left">Play</th>
                                        <th className="p-1 text-left">Personnel</th>
                                        <th className="p-1 text-left">Notes</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {currentPlays.slice(0, 5).map((play, i) => (
                                        <tr key={play.id} className="border-b border-blue-100">
                                          <td className="p-1 font-medium">{play.number || i + 1}</td>
                                          <td className="p-1">{play.formation}</td>
                                          <td className="p-1">{play.motion}</td>
                                          <td className="p-1">{play.personnel}</td>
                                          <td className="p-1 truncate max-w-xs">{play.notes}</td>
                                        </tr>
                                      ))}
                                      {currentPlays.length > 5 && (
                                        <tr>
                                          <td colSpan={5} className="p-1 text-center text-blue-600">
                                            +{currentPlays.length - 5} more plays
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-blue-600">
                                  <p className="text-sm">No plays in this situation yet</p>
                                  <p className="text-xs">
                                    Add plays to the "{linkedSituation.name}" situation to see them here
                                  </p>
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
                    )
                  })
                )}
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Practice Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedScriptData.periods.reduce((sum, period) => sum + Number(period.time), 0)}
                      </div>
                      <div className="text-sm text-blue-600">Total Minutes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedScriptData.periods.length}</div>
                      <div className="text-sm text-green-600">Periods</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedScriptData.periods.filter((period) => period.name === "Team").length}
                      </div>
                      <div className="text-sm text-purple-600">Team Periods</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedScriptData.periods.reduce((total, period) => {
                          if (period.situationId) {
                            const situation = gamePlan.situations.find((s) => s.id === period.situationId)
                            return total + (situation ? situation.plays.length : 0)
                          }
                          return total
                        }, 0)}
                      </div>
                      <div className="text-sm text-orange-600">Total Plays</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
