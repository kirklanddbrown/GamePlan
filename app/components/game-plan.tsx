"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Target } from "lucide-react"
import { ConfirmationDialog } from "./ui/confirmation-dialog"
import type { Week, Situation, Play as PlayType } from "../page"

interface GamePlanProps {
  week: Week
  situations: Situation[]
  allPlays: PlayType[]
  onUpdateWeek: (week: Week) => void
  customPlayTypes: string[]
  setCustomPlayTypes: (types: string[]) => void
}

export function GamePlan({
  week,
  situations,
  allPlays,
  onUpdateWeek,
  customPlayTypes,
  setCustomPlayTypes,
}: GamePlanProps) {
  const [selectedSituations, setSelectedSituations] = useState<string[]>(
    week.selectedSituations || situations.map((s) => s.id),
  )
  const [isPlayDialogOpen, setIsPlayDialogOpen] = useState(false)
  const [editingPlay, setEditingPlay] = useState<PlayType | null>(null)
  const [expandedSituations, setExpandedSituations] = useState<Set<string>>(new Set())
  const [newPlayType, setNewPlayType] = useState("")
  const [showAddPlayType, setShowAddPlayType] = useState(false)

  // Confirmation dialog state
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; playId: string }>({
    isOpen: false,
    playId: "",
  })

  const [formData, setFormData] = useState({
    name: "",
    situationId: "",
    formation: "",
    playType: "run" as string,
    description: "",
    personnel: "",
    tags: "",
    notes: "",
  })

  const allPlayTypes = ["run", "pass", "special", ...customPlayTypes]

  const resetForm = () => {
    setFormData({
      name: "",
      situationId: "",
      formation: "",
      playType: "run",
      description: "",
      personnel: "",
      tags: "",
      notes: "",
    })
    setEditingPlay(null)
  }

  const handleSituationToggle = (situationId: string, checked: boolean) => {
    let newSelected: string[]
    if (checked) {
      newSelected = [...selectedSituations, situationId]
    } else {
      newSelected = selectedSituations.filter((id) => id !== situationId)
    }

    setSelectedSituations(newSelected)

    // Update the week with selected situations
    const updatedWeek = {
      ...week,
      selectedSituations: newSelected,
    }
    onUpdateWeek(updatedWeek)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    if (editingPlay) {
      // Update existing play in allPlays
      const updatedPlays = allPlays.map((p) =>
        p.id === editingPlay.id ? { ...editingPlay, ...formData, tags: tagsArray } : p,
      )

      // Update week plays if this play is in the week
      const updatedWeekPlays = week.weekPlays.map((p) =>
        p.id === editingPlay.id ? { ...editingPlay, ...formData, tags: tagsArray } : p,
      )

      const updatedWeek = {
        ...week,
        weekPlays: updatedWeekPlays,
      }
      onUpdateWeek(updatedWeek)
    } else {
      const newPlay: PlayType = {
        id: Date.now().toString(),
        ...formData,
        tags: tagsArray,
      }

      // Add to week plays
      const updatedWeek = {
        ...week,
        weekPlays: [...week.weekPlays, newPlay],
      }
      onUpdateWeek(updatedWeek)
    }

    resetForm()
    setIsPlayDialogOpen(false)
  }

  const handleEdit = (play: PlayType) => {
    setEditingPlay(play)
    setFormData({
      name: play.name,
      situationId: play.situationId,
      formation: play.formation,
      playType: play.playType,
      description: play.description,
      personnel: play.personnel,
      tags: play.tags.join(", "),
      notes: play.notes || "",
    })
    setIsPlayDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      playId: id,
    })
  }

  const confirmDeletePlay = () => {
    // Remove from week plays
    const updatedWeek = {
      ...week,
      weekPlays: week.weekPlays.filter((p) => p.id !== confirmDelete.playId),
    }
    onUpdateWeek(updatedWeek)
    setConfirmDelete({ isOpen: false, playId: "" })
  }

  const toggleSituationExpanded = (situationId: string) => {
    const newExpanded = new Set(expandedSituations)
    if (newExpanded.has(situationId)) {
      newExpanded.delete(situationId)
    } else {
      newExpanded.add(situationId)
    }
    setExpandedSituations(newExpanded)
  }

  const addCustomPlayType = () => {
    if (newPlayType.trim() && !allPlayTypes.includes(newPlayType.trim())) {
      setCustomPlayTypes([...customPlayTypes, newPlayType.trim()])
      setNewPlayType("")
      setShowAddPlayType(false)
    }
  }

  const getPlayTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "run":
        return "bg-green-100 text-green-800"
      case "pass":
        return "bg-blue-100 text-blue-800"
      case "special":
        return "bg-purple-100 text-purple-800"
      case "screen":
        return "bg-cyan-100 text-cyan-800"
      case "play action":
        return "bg-indigo-100 text-indigo-800"
      case "rpo":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPlaysForSituation = (situationId: string) => {
    return week.weekPlays.filter((play) => play.situationId === situationId)
  }

  const filteredSituations = situations.filter((situation) => selectedSituations.includes(situation.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Game Plan vs {week.opponent}</h2>
          <p className="text-gray-600">Select situations and create plays for this week's game plan</p>
        </div>
      </div>

      {/* Situation Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Game Situations</CardTitle>
          <p className="text-sm text-gray-600">Choose which situations to focus on for this week's game plan</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {situations.map((situation) => (
              <div key={situation.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={situation.id}
                  checked={selectedSituations.includes(situation.id)}
                  onCheckedChange={(checked) => handleSituationToggle(situation.id, checked as boolean)}
                />
                <div className="flex-1">
                  <div className="font-medium">{situation.name}</div>
                  <div className="text-sm text-gray-600">
                    {situation.down}
                    {situation.down === 1 ? "st" : situation.down === 2 ? "nd" : situation.down === 3 ? "rd" : "th"} &{" "}
                    {situation.distance}
                    {situation.fieldPosition && ` - ${situation.fieldPosition}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Situations with Plays */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Plays by Situation</h3>
          <Dialog open={isPlayDialogOpen} onOpenChange={setIsPlayDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Play
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlay ? "Edit Play" : "Create New Play"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="playName">Play Name</Label>
                  <Input
                    id="playName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Power O Right"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="situation">Situation</Label>
                  <Select
                    value={formData.situationId}
                    onValueChange={(value) => setFormData({ ...formData, situationId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select situation" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSituations.map((situation) => (
                        <SelectItem key={situation.id} value={situation.id}>
                          {situation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="formation">Formation</Label>
                    <Input
                      id="formation"
                      value={formData.formation}
                      onChange={(e) => setFormData({ ...formData, formation: e.target.value })}
                      placeholder="e.g., I-Formation"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="playType">Play Type</Label>
                    <div className="space-y-2">
                      <Select
                        value={formData.playType}
                        onValueChange={(value) => setFormData({ ...formData, playType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allPlayTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddPlayType(!showAddPlayType)}
                        className="w-full"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Custom Type
                      </Button>
                      {showAddPlayType && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="New play type..."
                            value={newPlayType}
                            onChange={(e) => setNewPlayType(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addCustomPlayType()}
                          />
                          <Button type="button" size="sm" onClick={addCustomPlayType}>
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="personnel">Personnel</Label>
                  <Input
                    id="personnel"
                    value={formData.personnel}
                    onChange={(e) => setFormData({ ...formData, personnel: e.target.value })}
                    placeholder="e.g., 11 Personnel, 21 Personnel"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed play description..."
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., short-yardage, goal-line, quick-game"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or coaching points..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingPlay ? "Update" : "Create"} Play
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsPlayDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Situations with Plays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSituations.map((situation) => {
            const situationPlays = getPlaysForSituation(situation.id)
            const isExpanded = expandedSituations.has(situation.id)

            return (
              <Card key={situation.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{situation.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {situationPlays.length} plays
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleSituationExpanded(situation.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {situation.down}
                    {situation.down === 1 ? "st" : situation.down === 2 ? "nd" : situation.down === 3 ? "rd" : "th"} &{" "}
                    {situation.distance}
                    {situation.fieldPosition && ` - ${situation.fieldPosition}`}
                  </div>
                </CardHeader>

                <Collapsible open={isExpanded}>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {situationPlays.length === 0 ? (
                          <p className="text-sm text-gray-500 italic py-4 text-center">
                            No plays added yet. Click "Add Play" to create plays for this situation.
                          </p>
                        ) : (
                          situationPlays.map((play) => (
                            <div
                              key={play.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{play.name}</div>
                                <div className="text-sm text-gray-600">{play.formation}</div>
                                <div className="mt-1">
                                  <Badge className={getPlayTypeColor(play.playType)} size="sm">
                                    {play.playType.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(play)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(play.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>

        {filteredSituations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No situations selected</h3>
            <p className="text-sm mb-4">Select situations above to start building your game plan.</p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={confirmDeletePlay}
        title="Delete Play"
        description="Are you sure you want to delete this play? This action cannot be undone."
      />
    </div>
  )
}
