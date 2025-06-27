"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGamePlans } from "@/contexts/game-plan-context"
import { usePlayDatabase } from "@/contexts/play-database-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Save, X, Target, Search, BookOpen, Calendar, ClipboardList } from "lucide-react"
import { DailyScriptManager } from "@/components/daily-script-manager"
import { CallSheetManager } from "@/components/call-sheet-manager"

interface GamePlanEditorProps {
  gamePlanId: string
}

export function GamePlanEditor({ gamePlanId }: GamePlanEditorProps) {
  const { gamePlans, updateGamePlan } = useGamePlans()
  const { playTemplates, findPlayByName, getNextPlayNumber, addPlayTemplate } = usePlayDatabase()
  const { toast } = useToast()
  const gamePlan = gamePlans.find((plan) => plan.id === gamePlanId)

  const [activeTab, setActiveTab] = useState("situations")
  const [activeSituation, setActiveSituation] = useState(gamePlan?.situations[0]?.id || "")
  const [newPlay, setNewPlay] = useState({
    number: "",
    hash: "",
    personnel: "",
    formation: "",
    motion: "",
    frontBlitz: "",
    coverage: "",
    notes: "",
    playName: "",
  })
  const [isAddingPlay, setIsAddingPlay] = useState(false)
  const [isCreatingNewPlay, setIsCreatingNewPlay] = useState(false)

  const [newSituation, setNewSituation] = useState({
    name: "",
    color: "bg-blue-600",
  })
  const [isAddingSituation, setIsAddingSituation] = useState(false)

  if (!gamePlan) {
    return <div>Game plan not found</div>
  }

  const currentSituation = gamePlan.situations.find((s) => s.id === activeSituation)

  const handleQuickAddPlay = () => {
    if (!currentSituation) return

    const nextNumber = getNextPlayNumber()
    const play = {
      id: `play-${Date.now()}`,
      number: nextNumber,
      hash: "",
      personnel: "11",
      formation: "",
      motion: "",
      frontBlitz: "",
      coverage: "",
      notes: "",
    }

    const updatedSituations = gamePlan.situations.map((situation) => {
      if (situation.id === currentSituation.id) {
        return {
          ...situation,
          plays: [...situation.plays, play],
        }
      }
      return situation
    })

    updateGamePlan(gamePlanId, {
      ...gamePlan,
      situations: updatedSituations,
    })

    toast({
      title: "Play added",
      description: `Play #${nextNumber} added to ${currentSituation.name}`,
    })
  }

  const handleAddPlayFromTemplate = () => {
    if (!currentSituation || !newPlay.playName) return

    const existingPlay = findPlayByName(newPlay.playName)

    if (existingPlay) {
      // Use existing play template
      const play = {
        id: `play-${Date.now()}`,
        number: newPlay.number || getNextPlayNumber(),
        hash: newPlay.hash,
        personnel: existingPlay.personnel,
        formation: existingPlay.formation,
        motion: existingPlay.motion,
        frontBlitz: newPlay.frontBlitz,
        coverage: newPlay.coverage,
        notes: newPlay.notes,
      }

      const updatedSituations = gamePlan.situations.map((situation) => {
        if (situation.id === currentSituation.id) {
          return {
            ...situation,
            plays: [...situation.plays, play],
          }
        }
        return situation
      })

      updateGamePlan(gamePlanId, {
        ...gamePlan,
        situations: updatedSituations,
      })

      setNewPlay({
        number: "",
        hash: "",
        personnel: "",
        formation: "",
        motion: "",
        frontBlitz: "",
        coverage: "",
        notes: "",
        playName: "",
      })

      setIsAddingPlay(false)

      toast({
        title: "Play added from template",
        description: `${existingPlay.name} added to ${currentSituation.name}`,
      })
    } else {
      // Play doesn't exist, show creation dialog
      setIsCreatingNewPlay(true)
    }
  }

  const handleCreateNewPlay = () => {
    if (!currentSituation || !newPlay.playName) return

    // Create new play template
    const playTemplate = {
      id: `template-${Date.now()}`,
      number: newPlay.number || getNextPlayNumber(),
      name: newPlay.playName,
      formation: newPlay.formation,
      motion: newPlay.motion,
      personnel: newPlay.personnel,
      category: "Custom",
      description: newPlay.notes,
      tags: [],
    }

    addPlayTemplate(playTemplate)

    // Add play to game plan
    const play = {
      id: `play-${Date.now()}`,
      number: playTemplate.number,
      hash: newPlay.hash,
      personnel: newPlay.personnel,
      formation: newPlay.formation,
      motion: newPlay.motion,
      frontBlitz: newPlay.frontBlitz,
      coverage: newPlay.coverage,
      notes: newPlay.notes,
    }

    const updatedSituations = gamePlan.situations.map((situation) => {
      if (situation.id === currentSituation.id) {
        return {
          ...situation,
          plays: [...situation.plays, play],
        }
      }
      return situation
    })

    updateGamePlan(gamePlanId, {
      ...gamePlan,
      situations: updatedSituations,
    })

    setNewPlay({
      number: "",
      hash: "",
      personnel: "",
      formation: "",
      motion: "",
      frontBlitz: "",
      coverage: "",
      notes: "",
      playName: "",
    })

    setIsAddingPlay(false)
    setIsCreatingNewPlay(false)

    toast({
      title: "New play created",
      description: `${newPlay.playName} created and added to ${currentSituation.name}`,
    })
  }

  const handleUpdatePlay = (situationId: string, playId: string, field: string, value: string) => {
    const updatedSituations = gamePlan.situations.map((situation) => {
      if (situation.id === situationId) {
        return {
          ...situation,
          plays: situation.plays.map((play) => {
            if (play.id === playId) {
              return {
                ...play,
                [field]: value,
              }
            }
            return play
          }),
        }
      }
      return situation
    })

    updateGamePlan(gamePlanId, {
      ...gamePlan,
      situations: updatedSituations,
    })
  }

  const handleDeletePlay = (situationId: string, playId: string) => {
    const updatedSituations = gamePlan.situations.map((situation) => {
      if (situation.id === situationId) {
        return {
          ...situation,
          plays: situation.plays.filter((play) => play.id !== playId),
        }
      }
      return situation
    })

    updateGamePlan(gamePlanId, {
      ...gamePlan,
      situations: updatedSituations,
    })

    toast({
      title: "Play deleted",
      description: "The play has been removed from the game plan",
    })
  }

  const handleAddSituation = () => {
    if (!newSituation.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a situation name",
        variant: "destructive",
      })
      return
    }

    const situation = {
      id: `situation-${Date.now()}`,
      name: newSituation.name,
      color: newSituation.color,
      plays: [],
    }

    const updatedSituations = [...gamePlan.situations, situation]

    updateGamePlan(gamePlanId, {
      ...gamePlan,
      situations: updatedSituations,
    })

    setNewSituation({
      name: "",
      color: "bg-blue-600",
    })

    setIsAddingSituation(false)
    setActiveSituation(situation.id)

    toast({
      title: "Situation added",
      description: `"${newSituation.name}" has been added to the game plan`,
    })
  }

  const handleDeleteSituation = (situationId: string) => {
    const updatedSituations = gamePlan.situations.filter((s) => s.id !== situationId)

    updateGamePlan(gamePlanId, {
      ...gamePlan,
      situations: updatedSituations,
    })

    // If we deleted the active situation, switch to the first available one
    if (activeSituation === situationId) {
      setActiveSituation(updatedSituations[0]?.id || "")
    }

    toast({
      title: "Situation deleted",
      description: "The situation and all its plays have been removed",
    })
  }

  // If no situations exist, show the setup screen
  if (gamePlan.situations.length === 0 && activeTab === "situations") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Setup Game Plan: Week {gamePlan.week} vs {gamePlan.opponent}
          </h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="situations">Situations</TabsTrigger>
            <TabsTrigger value="daily-scripts">Daily Scripts</TabsTrigger>
            <TabsTrigger value="call-sheets">Call Sheets</TabsTrigger>
          </TabsList>

          <TabsContent value="situations" className="mt-4">
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Situations Added Yet</h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  Start building your game plan by adding custom situations like "Open Field", "Red Zone", "3rd Down",
                  etc.
                </p>

                <Dialog open={isAddingSituation} onOpenChange={setIsAddingSituation}>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Situation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Custom Situation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Situation Name</label>
                        <Input
                          value={newSituation.name}
                          onChange={(e) => setNewSituation({ ...newSituation, name: e.target.value })}
                          placeholder="e.g. Open Field, Red Zone, 3rd Down"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Color Theme</label>
                        <Select
                          value={newSituation.color}
                          onValueChange={(value) => setNewSituation({ ...newSituation, color: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bg-red-600">Red</SelectItem>
                            <SelectItem value="bg-blue-600">Blue</SelectItem>
                            <SelectItem value="bg-green-600">Green</SelectItem>
                            <SelectItem value="bg-purple-600">Purple</SelectItem>
                            <SelectItem value="bg-orange-600">Orange</SelectItem>
                            <SelectItem value="bg-yellow-600">Yellow</SelectItem>
                            <SelectItem value="bg-pink-600">Pink</SelectItem>
                            <SelectItem value="bg-indigo-600">Indigo</SelectItem>
                            <SelectItem value="bg-gray-600">Gray</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddSituation} className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Add Situation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Custom Situation Examples:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                    <div>• Open Field</div>
                    <div>• Red Zone</div>
                    <div>• Goal Line</div>
                    <div>• 3rd Down</div>
                    <div>• Two Minute Drill</div>
                    <div>• Short Yardage</div>
                    <div>• Backed Up</div>
                    <div>• Special Packages</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily-scripts" className="mt-4">
            <DailyScriptManager gamePlanId={gamePlanId} />
          </TabsContent>

          <TabsContent value="call-sheets" className="mt-4">
            <CallSheetManager gamePlanId={gamePlanId} />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Editing Game Plan: Week {gamePlan.week} vs {gamePlan.opponent}
        </h2>
        <div className="flex gap-2">
          <Dialog open={isAddingSituation} onOpenChange={setIsAddingSituation}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Situation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Situation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Situation Name</label>
                  <Input
                    value={newSituation.name}
                    onChange={(e) => setNewSituation({ ...newSituation, name: e.target.value })}
                    placeholder="e.g. Open Field, Red Zone, 3rd Down"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color Theme</label>
                  <Select
                    value={newSituation.color}
                    onValueChange={(value) => setNewSituation({ ...newSituation, color: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-red-600">Red</SelectItem>
                      <SelectItem value="bg-blue-600">Blue</SelectItem>
                      <SelectItem value="bg-green-600">Green</SelectItem>
                      <SelectItem value="bg-purple-600">Purple</SelectItem>
                      <SelectItem value="bg-orange-600">Orange</SelectItem>
                      <SelectItem value="bg-yellow-600">Yellow</SelectItem>
                      <SelectItem value="bg-pink-600">Pink</SelectItem>
                      <SelectItem value="bg-indigo-600">Indigo</SelectItem>
                      <SelectItem value="bg-gray-600">Gray</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddSituation} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Add Situation
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleQuickAddPlay} disabled={!currentSituation || activeTab !== "situations"}>
            <Plus className="w-4 h-4 mr-2" />
            Quick Add Play
          </Button>

          <Dialog open={isAddingPlay} onOpenChange={setIsAddingPlay}>
            <DialogTrigger asChild>
              <Button disabled={!currentSituation || activeTab !== "situations"}>
                <BookOpen className="w-4 h-4 mr-2" />
                Add from Playbook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Play to {currentSituation?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Play Name</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={newPlay.playName}
                      onChange={(e) => setNewPlay({ ...newPlay, playName: e.target.value })}
                      placeholder="Search or enter play name..."
                      className="pl-10"
                    />
                  </div>
                  {newPlay.playName && (
                    <div className="text-xs text-gray-500">
                      {findPlayByName(newPlay.playName) ? (
                        <span className="text-green-600">✓ Found in playbook</span>
                      ) : (
                        <span className="text-amber-600">⚠ New play - will be added to playbook</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Play # (Auto)</label>
                    <Input
                      value={newPlay.number || getNextPlayNumber()}
                      onChange={(e) => setNewPlay({ ...newPlay, number: e.target.value })}
                      placeholder="Auto-assigned"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hash</label>
                    <Select value={newPlay.hash} onValueChange={(value) => setNewPlay({ ...newPlay, hash: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hash" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Left</SelectItem>
                        <SelectItem value="M">Middle</SelectItem>
                        <SelectItem value="R">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Personnel</label>
                    <Select
                      value={newPlay.personnel}
                      onValueChange={(value) => setNewPlay({ ...newPlay, personnel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select personnel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11">11 Personnel</SelectItem>
                        <SelectItem value="12">12 Personnel</SelectItem>
                        <SelectItem value="21">21 Personnel</SelectItem>
                        <SelectItem value="22">22 Personnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Formation</label>
                    <Input
                      value={newPlay.formation}
                      onChange={(e) => setNewPlay({ ...newPlay, formation: e.target.value })}
                      placeholder="Formation"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Motion / Play</label>
                  <Input
                    value={newPlay.motion}
                    onChange={(e) => setNewPlay({ ...newPlay, motion: e.target.value })}
                    placeholder="Motion / Play"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Front/Blitz</label>
                    <Input
                      value={newPlay.frontBlitz}
                      onChange={(e) => setNewPlay({ ...newPlay, frontBlitz: e.target.value })}
                      placeholder="Front/Blitz"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Coverage</label>
                    <Input
                      value={newPlay.coverage}
                      onChange={(e) => setNewPlay({ ...newPlay, coverage: e.target.value })}
                      placeholder="Coverage"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    value={newPlay.notes}
                    onChange={(e) => setNewPlay({ ...newPlay, notes: e.target.value })}
                    placeholder="Notes"
                  />
                </div>

                <Button onClick={handleAddPlayFromTemplate} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Add Play
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* New Play Creation Dialog */}
          <Dialog open={isCreatingNewPlay} onOpenChange={setIsCreatingNewPlay}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Play: {newPlay.playName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    This play doesn't exist in your playbook yet. Fill in the details to create it.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Formation</label>
                    <Input
                      value={newPlay.formation}
                      onChange={(e) => setNewPlay({ ...newPlay, formation: e.target.value })}
                      placeholder="e.g. Gun Spread, I-Formation"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Personnel</label>
                    <Select
                      value={newPlay.personnel}
                      onValueChange={(value) => setNewPlay({ ...newPlay, personnel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select personnel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11">11 Personnel</SelectItem>
                        <SelectItem value="12">12 Personnel</SelectItem>
                        <SelectItem value="21">21 Personnel</SelectItem>
                        <SelectItem value="22">22 Personnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Motion / Play Action</label>
                  <Input
                    value={newPlay.motion}
                    onChange={(e) => setNewPlay({ ...newPlay, motion: e.target.value })}
                    placeholder="Describe the play action"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Play Description</label>
                  <Input
                    value={newPlay.notes}
                    onChange={(e) => setNewPlay({ ...newPlay, notes: e.target.value })}
                    placeholder="Brief description of the play"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateNewPlay} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Create & Add Play
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreatingNewPlay(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="situations">Situations</TabsTrigger>
          <TabsTrigger value="daily-scripts" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Daily Scripts
          </TabsTrigger>
          <TabsTrigger value="call-sheets" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Call Sheets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="situations" className="mt-4">
          {/* Folder-style tabs for situations */}
          <div className="mb-4">
            <div className="flex items-end gap-1 overflow-x-auto">
              {gamePlan.situations.map((situation) => (
                <div key={situation.id} className="relative flex-shrink-0">
                  <button
                    onClick={() => setActiveSituation(situation.id)}
                    className={`
                      relative px-6 py-3 text-sm font-medium text-white rounded-t-lg border-t-2 border-l-2 border-r-2 border-gray-300
                      ${activeSituation === situation.id ? "z-10 border-b-0" : "border-b-2 opacity-80"}
                      ${situation.color}
                      hover:opacity-100 transition-opacity
                      min-w-[120px] text-center
                    `}
                    style={{
                      clipPath:
                        activeSituation === situation.id
                          ? "polygon(0 100%, 0 20px, 20px 0, calc(100% - 20px) 0, 100% 20px, 100% 100%)"
                          : "polygon(0 100%, 0 25px, 15px 0, calc(100% - 15px) 0, 100% 25px, 100% 100%)",
                    }}
                  >
                    {situation.name}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSituation(situation.id)}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white hover:bg-red-600 z-20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            {/* Blue bar below tabs */}
            <div className="h-1 bg-blue-600 w-full"></div>
          </div>

          {currentSituation && (
            <Card>
              <CardHeader className={`${currentSituation.color} text-white`}>
                <CardTitle className="flex justify-between items-center">
                  <span>{currentSituation.name}</span>
                  <span>{currentSituation.plays.length} Plays</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-sm font-medium w-12">#</th>
                        <th className="border p-2 text-sm font-medium w-12">H</th>
                        <th className="border p-2 text-sm font-medium w-12">P</th>
                        <th className="border p-2 text-sm font-medium w-24">Form</th>
                        <th className="border p-2 text-sm font-medium w-32">Motion / Play</th>
                        <th className="border p-2 text-sm font-medium w-24">Front/Blitz</th>
                        <th className="border p-2 text-sm font-medium w-24">Coverage</th>
                        <th className="border p-2 text-sm font-medium w-32">Notes</th>
                        <th className="border p-2 text-sm font-medium w-16">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSituation.plays.map((play) => (
                        <tr key={play.id} className="hover:bg-gray-50">
                          <td className="border p-1">
                            <Input
                              value={play.number}
                              onChange={(e) => handleUpdatePlay(currentSituation.id, play.id, "number", e.target.value)}
                              className="w-full text-xs border-0 p-1 font-medium"
                            />
                          </td>
                          <td className="border p-1">
                            <Select
                              value={play.hash}
                              onValueChange={(value) => handleUpdatePlay(currentSituation.id, play.id, "hash", value)}
                            >
                              <SelectTrigger className="w-full text-xs border-0 p-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                                <SelectItem value="R">R</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="border p-1">
                            <Select
                              value={play.personnel}
                              onValueChange={(value) =>
                                handleUpdatePlay(currentSituation.id, play.id, "personnel", value)
                              }
                            >
                              <SelectTrigger className="w-full text-xs border-0 p-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="11">11</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                                <SelectItem value="21">21</SelectItem>
                                <SelectItem value="22">22</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="border p-1">
                            <Input
                              value={play.formation}
                              onChange={(e) =>
                                handleUpdatePlay(currentSituation.id, play.id, "formation", e.target.value)
                              }
                              className="w-full text-xs border-0 p-1"
                            />
                          </td>
                          <td className="border p-1">
                            <Input
                              value={play.motion}
                              onChange={(e) => handleUpdatePlay(currentSituation.id, play.id, "motion", e.target.value)}
                              className="w-full text-xs border-0 p-1"
                            />
                          </td>
                          <td className="border p-1">
                            <Input
                              value={play.frontBlitz}
                              onChange={(e) =>
                                handleUpdatePlay(currentSituation.id, play.id, "frontBlitz", e.target.value)
                              }
                              className="w-full text-xs border-0 p-1"
                            />
                          </td>
                          <td className="border p-1">
                            <Input
                              value={play.coverage}
                              onChange={(e) =>
                                handleUpdatePlay(currentSituation.id, play.id, "coverage", e.target.value)
                              }
                              className="w-full text-xs border-0 p-1"
                            />
                          </td>
                          <td className="border p-1">
                            <Input
                              value={play.notes}
                              onChange={(e) => handleUpdatePlay(currentSituation.id, play.id, "notes", e.target.value)}
                              className="w-full text-xs border-0 p-1"
                            />
                          </td>
                          <td className="border p-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePlay(currentSituation.id, play.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {currentSituation.plays.length === 0 && (
                        <tr>
                          <td colSpan={9} className="text-center py-8 text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <p>No plays added yet.</p>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleQuickAddPlay}>
                                  <Plus className="w-3 h-3 mr-1" />
                                  Quick Add
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setIsAddingPlay(true)}>
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  From Playbook
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Play Database Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Playbook Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{playTemplates.length}</div>
                  <div className="text-sm text-blue-600">Total Plays</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {playTemplates.filter((p) => p.category === "Run").length}
                  </div>
                  <div className="text-sm text-green-600">Run Plays</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {playTemplates.filter((p) => p.category === "Pass").length}
                  </div>
                  <div className="text-sm text-purple-600">Pass Plays</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {playTemplates.filter((p) => p.category === "Custom").length}
                  </div>
                  <div className="text-sm text-orange-600">Custom Plays</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-scripts" className="mt-4">
          <DailyScriptManager gamePlanId={gamePlanId} />
        </TabsContent>

        <TabsContent value="call-sheets" className="mt-4">
          <CallSheetManager gamePlanId={gamePlanId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
