"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, FileText, Play, GripVertical, ChevronDown, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import type { Week, Situation, Play as PlayType, PlayScript } from "../page"

interface PlayScriptsProps {
  week: Week
  situations: Situation[]
  allPlays: PlayType[]
  onUpdateWeek: (week: Week) => void
}

interface ScriptDetailProps {
  script: PlayScript
  situations: Situation[]
  allPlays: PlayType[]
  onUpdateScript: (updatedScript: PlayScript) => void
}

export function PlayScripts({ week, situations, allPlays, onUpdateWeek }: PlayScriptsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingScript, setEditingScript] = useState<PlayScript | null>(null)
  const [selectedScript, setSelectedScript] = useState<PlayScript | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    situationId: "",
    selectedPlays: [] as string[],
  })

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      situationId: "",
      selectedPlays: [],
    })
    setEditingScript(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingScript) {
      const updatedScript: PlayScript = {
        ...editingScript,
        name: formData.name,
        description: formData.description,
        situationId: formData.situationId || undefined,
        plays: formData.selectedPlays,
      }
      const updatedWeek = {
        ...week,
        playScripts: week.playScripts.map((s) => (s.id === editingScript.id ? updatedScript : s)),
      }
      onUpdateWeek(updatedWeek)
      if (selectedScript?.id === editingScript.id) {
        setSelectedScript(updatedScript)
      }
    } else {
      const newScript: PlayScript = {
        id: Date.now().toString(),
        weekId: week.id,
        name: formData.name,
        description: formData.description,
        situationId: formData.situationId || undefined,
        plays: formData.selectedPlays,
        createdAt: new Date().toISOString(),
      }
      const updatedWeek = {
        ...week,
        playScripts: [...week.playScripts, newScript],
      }
      onUpdateWeek(updatedWeek)
      setSelectedScript(newScript)
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (script: PlayScript) => {
    setEditingScript(script)
    setFormData({
      name: script.name,
      description: script.description,
      situationId: script.situationId || "",
      selectedPlays: script.plays,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (scriptId: string) => {
    const updatedWeek = {
      ...week,
      playScripts: week.playScripts.filter((s) => s.id !== scriptId),
    }
    onUpdateWeek(updatedWeek)
    if (selectedScript?.id === scriptId) {
      setSelectedScript(null)
    }
  }

  const handlePlayToggle = (playId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        selectedPlays: [...formData.selectedPlays, playId],
      })
    } else {
      setFormData({
        ...formData,
        selectedPlays: formData.selectedPlays.filter((id) => id !== playId),
      })
    }
  }

  const handleUpdateScript = (updatedScript: PlayScript) => {
    const updatedWeek = {
      ...week,
      playScripts: week.playScripts.map((s) => (s.id === updatedScript.id ? updatedScript : s)),
    }
    onUpdateWeek(updatedWeek)
    setSelectedScript(updatedScript)
  }

  const getPlayById = (playId: string) => allPlays.find((p) => p.id === playId)
  const getSituationById = (situationId: string) => situations.find((s) => s.id === situationId)

  return (
    <div className="space-y-6">
      {selectedScript ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" onClick={() => setSelectedScript(null)}>
              Back to Scripts
            </Button>
            <h3 className="text-lg font-semibold">{selectedScript.name}</h3>
          </div>
          <ScriptDetail
            script={selectedScript}
            situations={situations}
            allPlays={allPlays}
            onUpdateScript={handleUpdateScript}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Play Scripts</h3>
              <p className="text-sm text-gray-600 mt-1">Create scripted play sequences for specific situations</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Script
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingScript ? "Edit Script" : "Create New Script"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="scriptName">Script Name</Label>
                    <Input
                      id="scriptName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Opening Drive, Red Zone, Two Minute"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="situation">Situation (Optional)</Label>
                    <Select
                      value={formData.situationId}
                      onValueChange={(value) => setFormData({ ...formData, situationId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select situation (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific situation</SelectItem>
                        {situations.map((situation) => (
                          <SelectItem key={situation.id} value={situation.id}>
                            {situation.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe when and how to use this script..."
                    />
                  </div>

                  <div>
                    <Label>Select Plays</Label>
                    <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                      {allPlays.map((play) => {
                        const situation = getSituationById(play.situationId)
                        return (
                          <div key={play.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                              id={play.id}
                              checked={formData.selectedPlays.includes(play.id)}
                              onCheckedChange={(checked) => handlePlayToggle(play.id, checked as boolean)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{play.name}</div>
                              <div className="text-sm text-gray-600">{play.formation}</div>
                              {situation && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {situation.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Selected: {formData.selectedPlays.length} plays</p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingScript ? "Update" : "Create"} Script
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Script Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {week.playScripts.map((script) => {
              const situation = script.situationId ? getSituationById(script.situationId) : null
              return (
                <Card key={script.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          {script.name}
                        </CardTitle>
                        {situation && (
                          <Badge variant="outline" className="mt-2">
                            {situation.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(script)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(script.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3" onClick={() => setSelectedScript(script)}>
                    {script.description && <p className="text-sm text-gray-700">{script.description}</p>}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Plays ({script.plays.length})</span>
                      </div>
                      <div className="space-y-1">
                        {script.plays.slice(0, 5).map((playId, index) => {
                          const play = getPlayById(playId)
                          return play ? (
                            <div key={playId} className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span className="font-medium">{play.formation}</span>
                              <span>-</span>
                              <span>{play.name}</span>
                            </div>
                          ) : null
                        })}
                        {script.plays.length > 5 && (
                          <div className="text-sm text-gray-500 ml-8">+{script.plays.length - 5} more plays</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {week.playScripts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No play scripts yet</h3>
              <p className="text-sm mb-4">Create your first play script to organize plays for specific situations.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Script
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ScriptDetail({ script, situations, allPlays, onUpdateScript }: ScriptDetailProps) {
  // Group plays by situation
  const [playsBySituation, setPlaysBySituation] = useState<Record<string, string[]>>({})
  const [situationsOrder, setSituationsOrder] = useState<string[]>([])
  const [expandedSituations, setExpandedSituations] = useState<Set<string>>(new Set())

  // Drag state
  const [draggedSituation, setDraggedSituation] = useState<string | null>(null)
  const [dragOverSituation, setDragOverSituation] = useState<string | null>(null)
  const [draggedPlay, setDraggedPlay] = useState<{ play: string; situation: string } | null>(null)
  const [dragOverPlay, setDragOverPlay] = useState<{ play: string; situation: string } | null>(null)

  // Initialize plays by situation and situation order
  useEffect(() => {
    const playsMap: Record<string, string[]> = {}
    const situationIds = new Set<string>()

    // Use existing play orders if available
    if (script.playOrders) {
      Object.assign(playsMap, script.playOrders)

      // Add any plays that might not be in the orders yet
      script.plays.forEach((playId) => {
        const play = allPlays.find((p) => p.id === playId)
        if (play) {
          const sitId = play.situationId
          situationIds.add(sitId)

          if (!playsMap[sitId]) {
            playsMap[sitId] = []
          }

          if (!playsMap[sitId].includes(playId)) {
            playsMap[sitId].push(playId)
          }
        }
      })
    } else {
      // Group plays by situation
      script.plays.forEach((playId) => {
        const play = allPlays.find((p) => p.id === playId)
        if (play) {
          const sitId = play.situationId
          situationIds.add(sitId)

          if (!playsMap[sitId]) {
            playsMap[sitId] = []
          }

          playsMap[sitId].push(playId)
        }
      })
    }

    // Set situation order
    let order: string[]
    if (script.situationsOrder && script.situationsOrder.length > 0) {
      // Use existing order and add any new situations
      order = [...script.situationsOrder]
      situationIds.forEach((id) => {
        if (!order.includes(id)) {
          order.push(id)
        }
      })
    } else {
      // Create new order based on situation order in the main list
      order = Array.from(situationIds).sort((a, b) => {
        const sitA = situations.findIndex((s) => s.id === a)
        const sitB = situations.findIndex((s) => s.id === b)
        return sitA - sitB
      })
    }

    setPlaysBySituation(playsMap)
    setSituationsOrder(order)

    // Expand all situations by default
    setExpandedSituations(new Set(order))
  }, [script, allPlays, situations])

  const getPlayById = (playId: string) => allPlays.find((p) => p.id === playId)
  const getSituationById = (situationId: string) => situations.find((s) => s.id === situationId)

  const toggleSituationExpanded = (situationId: string) => {
    const newExpanded = new Set(expandedSituations)
    if (newExpanded.has(situationId)) {
      newExpanded.delete(situationId)
    } else {
      newExpanded.add(situationId)
    }
    setExpandedSituations(newExpanded)
  }

  // Handle situation drag and drop
  const handleSituationDragStart = (e: React.DragEvent, situationId: string) => {
    setDraggedSituation(situationId)
  }

  const handleSituationDragOver = (e: React.DragEvent, situationId: string) => {
    e.preventDefault()
    if (draggedSituation && draggedSituation !== situationId) {
      setDragOverSituation(situationId)
    }
  }

  const handleSituationDrop = (e: React.DragEvent, targetSituationId: string) => {
    e.preventDefault()
    if (!draggedSituation || draggedSituation === targetSituationId) {
      setDraggedSituation(null)
      setDragOverSituation(null)
      return
    }

    const newOrder = [...situationsOrder]
    const fromIndex = newOrder.indexOf(draggedSituation)
    const toIndex = newOrder.indexOf(targetSituationId)

    if (fromIndex !== -1 && toIndex !== -1) {
      newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, draggedSituation)
      setSituationsOrder(newOrder)

      // Update script with new order
      onUpdateScript({
        ...script,
        situationsOrder: newOrder,
        playOrders: playsBySituation,
      })
    }

    setDraggedSituation(null)
    setDragOverSituation(null)
  }

  // Handle play drag and drop
  const handlePlayDragStart = (e: React.DragEvent, playId: string, situationId: string) => {
    setDraggedPlay({ play: playId, situation: situationId })
  }

  const handlePlayDragOver = (e: React.DragEvent, playId: string, situationId: string) => {
    e.preventDefault()
    if (draggedPlay && !(draggedPlay.play === playId && draggedPlay.situation === situationId)) {
      setDragOverPlay({ play: playId, situation: situationId })
    }
  }

  const handlePlayDrop = (e: React.DragEvent, targetPlayId: string, targetSituationId: string) => {
    e.preventDefault()
    if (!draggedPlay) {
      setDragOverPlay(null)
      return
    }

    const { play: draggedPlayId, situation: fromSituationId } = draggedPlay

    // Create a copy of the current state
    const newPlaysBySituation = { ...playsBySituation }

    // Remove from source
    if (newPlaysBySituation[fromSituationId]) {
      newPlaysBySituation[fromSituationId] = newPlaysBySituation[fromSituationId].filter((id) => id !== draggedPlayId)
    }

    // Add to target
    if (!newPlaysBySituation[targetSituationId]) {
      newPlaysBySituation[targetSituationId] = []
    }

    const targetIndex = newPlaysBySituation[targetSituationId].indexOf(targetPlayId)
    if (targetIndex !== -1) {
      newPlaysBySituation[targetSituationId].splice(targetIndex, 0, draggedPlayId)
    } else {
      newPlaysBySituation[targetSituationId].push(draggedPlayId)
    }

    setPlaysBySituation(newPlaysBySituation)

    // Update script with new play orders
    onUpdateScript({
      ...script,
      situationsOrder,
      playOrders: newPlaysBySituation,
    })

    setDraggedPlay(null)
    setDragOverPlay(null)
  }

  const handlePlayDragEnd = () => {
    setDraggedPlay(null)
    setDragOverPlay(null)
  }

  const handleSituationDragEnd = () => {
    setDraggedSituation(null)
    setDragOverSituation(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-blue-700">
          Drag and drop to rearrange situations and plays. Click on a situation header to expand or collapse it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {situationsOrder.map((situationId) => {
          const situation = getSituationById(situationId)
          const plays = playsBySituation[situationId] || []
          const isExpanded = expandedSituations.has(situationId)
          const isDraggedOver = dragOverSituation === situationId

          if (!situation) return null

          return (
            <Card
              key={situationId}
              className={`${isDraggedOver ? "border-blue-500 ring-2 ring-blue-300" : ""}`}
              draggable
              onDragStart={(e) => handleSituationDragStart(e, situationId)}
              onDragOver={(e) => handleSituationDragOver(e, situationId)}
              onDrop={(e) => handleSituationDrop(e, situationId)}
              onDragEnd={handleSituationDragEnd}
            >
              <CardHeader className="pb-2 cursor-move">
                <div className="flex items-center justify-between" onClick={() => toggleSituationExpanded(situationId)}>
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <CardTitle className="text-base">{situation.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>

              <Collapsible open={isExpanded}>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {plays.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No plays in this situation</p>
                      ) : (
                        plays.map((playId, index) => {
                          const play = getPlayById(playId)
                          const isDraggedOver = dragOverPlay?.play === playId && dragOverPlay?.situation === situationId

                          if (!play) return null

                          return (
                            <div
                              key={playId}
                              className={`flex items-center p-2 rounded-md ${
                                isDraggedOver ? "bg-blue-100" : "hover:bg-gray-50"
                              }`}
                              draggable
                              onDragStart={(e) => handlePlayDragStart(e, playId, situationId)}
                              onDragOver={(e) => handlePlayDragOver(e, playId, situationId)}
                              onDrop={(e) => handlePlayDrop(e, playId, situationId)}
                              onDragEnd={handlePlayDragEnd}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </span>
                                <div>
                                  <div className="font-medium">{play.name}</div>
                                  <div className="text-xs text-gray-600">{play.formation}</div>
                                </div>
                              </div>
                              <Badge className="ml-2">{play.playType}</Badge>
                            </div>
                          )
                        })
                      )}

                      {/* Drop zone for empty situation */}
                      {plays.length === 0 && (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500"
                          onDragOver={(e) => {
                            e.preventDefault()
                            if (draggedPlay) {
                              setDragOverPlay({ play: "dropzone", situation: situationId })
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            if (!draggedPlay) return

                            const { play: draggedPlayId, situation: fromSituationId } = draggedPlay

                            // Create a copy of the current state
                            const newPlaysBySituation = { ...playsBySituation }

                            // Remove from source
                            if (newPlaysBySituation[fromSituationId]) {
                              newPlaysBySituation[fromSituationId] = newPlaysBySituation[fromSituationId].filter(
                                (id) => id !== draggedPlayId,
                              )
                            }

                            // Add to target
                            if (!newPlaysBySituation[situationId]) {
                              newPlaysBySituation[situationId] = []
                            }

                            newPlaysBySituation[situationId].push(draggedPlayId)

                            setPlaysBySituation(newPlaysBySituation)

                            // Update script with new play orders
                            onUpdateScript({
                              ...script,
                              situationsOrder,
                              playOrders: newPlaysBySituation,
                            })

                            setDraggedPlay(null)
                            setDragOverPlay(null)
                          }}
                        >
                          Drop plays here
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
