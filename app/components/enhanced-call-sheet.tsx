"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Search, Filter, Edit, Trash2, Plus } from "lucide-react"
import { ConfirmationDialog } from "./ui/confirmation-dialog"
import type { Week, Situation, Play as PlayType } from "../page"

interface EnhancedCallSheetProps {
  week: Week
  situations: Situation[]
  onUpdateWeek: (week: Week) => void
  customPlayTypes: string[]
  setCustomPlayTypes: (types: string[]) => void
}

interface CallSheetPlay extends PlayType {
  hash?: "L" | "R" | "M" | ""
  position?: number
}

interface SituationSection {
  situation: Situation
  plays: CallSheetPlay[]
}

export function EnhancedCallSheet({
  week,
  situations,
  onUpdateWeek,
  customPlayTypes,
  setCustomPlayTypes,
}: EnhancedCallSheetProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSituation, setFilterSituation] = useState("")
  const [filterPlayType, setFilterPlayType] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPlay, setEditingPlay] = useState<CallSheetPlay | null>(null)
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

  // Get plays from week's play scripts and week plays
  const getAllWeekPlays = (): PlayType[] => {
    const scriptPlays: PlayType[] = []

    // Get plays from all scripts
    week.playScripts.forEach((script) => {
      script.plays.forEach((playId) => {
        const play = week.weekPlays.find((p) => p.id === playId)
        if (play && !scriptPlays.find((p) => p.id === play.id)) {
          scriptPlays.push(play)
        }
      })
    })

    // Add any week plays not in scripts
    week.weekPlays.forEach((play) => {
      if (!scriptPlays.find((p) => p.id === play.id)) {
        scriptPlays.push(play)
      }
    })

    return scriptPlays
  }

  // Initialize situation sections with plays
  const [situationSections, setSituationSections] = useState<SituationSection[]>(() => {
    const weekPlays = getAllWeekPlays()
    const selectedSituations = week.selectedSituations || situations.map((s) => s.id)

    return situations
      .filter((situation) => selectedSituations.includes(situation.id))
      .map((situation) => ({
        situation,
        plays: weekPlays
          .filter((play) => play.situationId === situation.id)
          .map((play, index) => ({
            ...play,
            hash: "",
            position: index,
          })),
      }))
  })

  const [draggedPlay, setDraggedPlay] = useState<{
    play: CallSheetPlay
    fromSituation: string
    fromIndex: number
  } | null>(null)
  const [dragOverSituation, setDragOverSituation] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Update when week changes
  React.useEffect(() => {
    const weekPlays = getAllWeekPlays()
    const selectedSituations = week.selectedSituations || situations.map((s) => s.id)

    setSituationSections((prevSections) => {
      return situations
        .filter((situation) => selectedSituations.includes(situation.id))
        .map((situation) => {
          const existingSection = prevSections.find((s) => s.situation.id === situation.id)
          const situationPlays = weekPlays.filter((play) => play.situationId === situation.id)

          if (existingSection) {
            // Update existing section, preserving hash and position data
            const updatedPlays = situationPlays.map((play) => {
              const existingPlay = existingSection.plays.find((p) => p.id === play.id)
              return existingPlay
                ? { ...play, hash: existingPlay.hash, position: existingPlay.position }
                : { ...play, hash: "", position: existingSection.plays.length }
            })
            return { ...existingSection, situation, plays: updatedPlays }
          } else {
            // New section
            return {
              situation,
              plays: situationPlays.map((play, index) => ({
                ...play,
                hash: "",
                position: index,
              })),
            }
          }
        })
    })
  }, [week, situations])

  const handleDragStart = (e: React.DragEvent, play: CallSheetPlay, situationId: string, index: number) => {
    setDraggedPlay({ play, fromSituation: situationId, fromIndex: index })
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, situationId: string, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverSituation(situationId)
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverSituation(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, targetSituationId: string, targetIndex: number) => {
    e.preventDefault()

    if (!draggedPlay) return

    const { play, fromSituation, fromIndex } = draggedPlay

    setSituationSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.situation.id === fromSituation) {
          // Remove from source
          const newPlays = [...section.plays]
          newPlays.splice(fromIndex, 1)
          return { ...section, plays: newPlays }
        } else if (section.situation.id === targetSituationId) {
          // Add to target
          const newPlays = [...section.plays]
          newPlays.splice(targetIndex, 0, play)
          return { ...section, plays: newPlays }
        }
        return section
      })
    })

    setDraggedPlay(null)
    setDragOverSituation(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedPlay(null)
    setDragOverSituation(null)
    setDragOverIndex(null)
  }

  const updatePlayHash = (situationId: string, playId: string, hash: "L" | "R" | "M" | "") => {
    setSituationSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.situation.id === situationId) {
          return {
            ...section,
            plays: section.plays.map((play) => (play.id === playId ? { ...play, hash } : play)),
          }
        }
        return section
      })
    })
  }

  const handleEdit = (play: CallSheetPlay) => {
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
    setIsEditDialogOpen(true)
  }

  const handleDelete = (playId: string) => {
    setConfirmDelete({
      isOpen: true,
      playId: playId,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    if (editingPlay) {
      // Update existing play
      const updatedWeekPlays = week.weekPlays.map((p) =>
        p.id === editingPlay.id ? { ...p, ...formData, tags: tagsArray } : p,
      )

      const updatedWeek = {
        ...week,
        weekPlays: updatedWeekPlays,
      }
      onUpdateWeek(updatedWeek)
    }

    resetForm()
    setIsEditDialogOpen(false)
  }

  const addCustomPlayType = () => {
    if (newPlayType.trim() && !allPlayTypes.includes(newPlayType.trim())) {
      setCustomPlayTypes([...customPlayTypes, newPlayType.trim()])
      setNewPlayType("")
      setShowAddPlayType(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterSituation("")
    setFilterPlayType("")
  }

  const getSituationColor = (index: number) => {
    const colors = [
      "bg-gray-800",
      "bg-green-700",
      "bg-blue-700",
      "bg-purple-700",
      "bg-red-700",
      "bg-yellow-600",
      "bg-orange-600",
      "bg-indigo-700",
    ]
    return colors[index % colors.length]
  }

  const filteredSections = situationSections.filter((section) => {
    if (!filterSituation || filterSituation === "all") return true
    return section.situation.id === filterSituation
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Call Sheet - {week.opponent}</h2>
          <p className="text-gray-600">Edit, delete, and reorder plays for game day</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Plays</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search plays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="situationFilter">Situation</Label>
              <Select value={filterSituation} onValueChange={setFilterSituation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Situations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Situations</SelectItem>
                  {situations.map((situation) => (
                    <SelectItem key={situation.id} value={situation.id}>
                      {situation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="playTypeFilter">Play Type</Label>
              <Select value={filterPlayType} onValueChange={setFilterPlayType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {allPlayTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2-Column Call Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSections.map((section, sectionIndex) => (
          <div key={section.situation.id} className="border rounded-lg overflow-hidden">
            {/* Situation Header */}
            <div className={`${getSituationColor(sectionIndex)} text-white p-3 text-center font-bold`}>
              {section.situation.name}
              <div className="text-sm font-normal mt-1">
                {section.situation.down}
                {section.situation.down === 1
                  ? "st"
                  : section.situation.down === 2
                    ? "nd"
                    : section.situation.down === 3
                      ? "rd"
                      : "th"}{" "}
                & {section.situation.distance}
                {section.situation.fieldPosition && ` - ${section.situation.fieldPosition}`}
              </div>
            </div>

            {/* Table Structure */}
            <div className="bg-white overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Table Header */}
                <thead>
                  <tr className="bg-gray-100 text-xs font-semibold">
                    <th className="p-2 border-r text-center w-8">#</th>
                    <th className="p-2 border-r text-center w-8">H</th>
                    <th className="p-2 border-r text-center w-12">P</th>
                    <th className="p-2 border-r text-center min-w-[120px]">Form</th>
                    <th className="p-2 border-r text-center min-w-[140px]">Motion / Play</th>
                    <th className="p-2 text-center w-20">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {Array.from({ length: Math.max(8, section.plays.length + 2) }, (_, index) => {
                    const play = section.plays[index]
                    const isDragOver = dragOverSituation === section.situation.id && dragOverIndex === index
                    return (
                      <tr
                        key={index}
                        className={`text-xs min-h-[36px] border-b ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } ${isDragOver ? "bg-blue-100" : ""}`}
                        onDragOver={(e) => handleDragOver(e, section.situation.id, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, section.situation.id, index)}
                      >
                        <td className="p-2 border-r text-center font-medium">{index + 1}</td>

                        {/* Hash Column - Editable */}
                        <td className="p-1 border-r text-center">
                          {play && (
                            <Select
                              value={play.hash || ""}
                              onValueChange={(value: "L" | "R" | "M" | "") =>
                                updatePlayHash(section.situation.id, play.id, value)
                              }
                            >
                              <SelectTrigger className="h-6 text-xs border-0 shadow-none w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="-">-</SelectItem>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="R">R</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </td>

                        {/* Personnel Column */}
                        <td className="p-2 border-r text-center">
                          {play && play.personnel && (
                            <div className="truncate" title={play.personnel}>
                              {play.personnel.replace("Personnel", "").trim()}
                            </div>
                          )}
                        </td>

                        {/* Formation Column - Draggable */}
                        <td className="p-2 border-r text-center">
                          {play && (
                            <div
                              className="cursor-move hover:bg-blue-50 p-1 rounded transition-colors"
                              draggable
                              onDragStart={(e) => handleDragStart(e, play, section.situation.id, index)}
                              onDragEnd={handleDragEnd}
                              title="Drag to reorder"
                            >
                              <div className="font-medium">{play.formation}</div>
                            </div>
                          )}
                        </td>

                        {/* Motion/Play Column */}
                        <td className="p-2 border-r text-center">
                          {play && (
                            <div className="text-gray-700">
                              <div className="font-medium">{play.name}</div>
                            </div>
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="p-1 text-center">
                          {play && (
                            <div className="flex gap-1 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleEdit(play)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDelete(play.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Drop zone at bottom */}
              <div
                className={`h-8 border-dashed border-2 border-gray-200 ${
                  dragOverSituation === section.situation.id && dragOverIndex === Math.max(8, section.plays.length + 2)
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, section.situation.id, section.plays.length)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, section.situation.id, section.plays.length)}
              >
                <div className="flex items-center justify-center h-full text-xs text-gray-400">
                  {dragOverSituation === section.situation.id ? "Drop here" : ""}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">
            <div className="font-semibold mb-2">Legend:</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium">H:</span> Hash Mark (L=Left, R=Right, M=Middle)
              </div>
              <div>
                <span className="font-medium">P:</span> Personnel Package
              </div>
              <div>
                <span className="font-medium">Actions:</span> Edit or delete plays directly from the call sheet
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Play Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Play</DialogTitle>
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
                  {situations.map((situation) => (
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
                Update Play
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={confirmDeletePlay}
        title="Delete Play"
        description="Are you sure you want to delete this play from the call sheet? This action cannot be undone."
      />
    </div>
  )
}
