"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Plus, Edit, Trash2, Play, ChevronDown, ChevronRight } from "lucide-react"
import { ConfirmationDialog } from "./ui/confirmation-dialog"
import type { Situation, Play as PlayType } from "../page"

interface PlayManagerProps {
  situations: Situation[]
  plays: PlayType[]
  setPlays: (plays: PlayType[]) => void
  customPlayTypes: string[]
  setCustomPlayTypes: (types: string[]) => void
}

export function PlayManager({ situations, plays, setPlays, customPlayTypes, setCustomPlayTypes }: PlayManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlay, setEditingPlay] = useState<PlayType | null>(null)
  const [selectedSituation, setSelectedSituation] = useState<string>("")
  const [filterFormation, setFilterFormation] = useState("")
  const [filterPlayType, setFilterPlayType] = useState("")
  const [filterPersonnel, setFilterPersonnel] = useState("")
  const [filterTags, setFilterTags] = useState("")
  const [expandedPlays, setExpandedPlays] = useState<Set<string>>(new Set())
  const [newPlayType, setNewPlayType] = useState("")
  const [showAddPlayType, setShowAddPlayType] = useState(false)

  // Confirmation dialog state
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; playId: string }>({
    isOpen: false,
    playId: "",
  })

  const [confirmDeleteType, setConfirmDeleteType] = useState<{ isOpen: boolean; playType: string }>({
    isOpen: false,
    playType: "",
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
      situationId: selectedSituation,
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
      setPlays(plays.map((p) => (p.id === editingPlay.id ? { ...editingPlay, ...formData, tags: tagsArray } : p)))
    } else {
      const newPlay: PlayType = {
        id: Date.now().toString(),
        ...formData,
        tags: tagsArray,
      }
      setPlays([...plays, newPlay])
    }

    resetForm()
    setIsDialogOpen(false)
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
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      playId: id,
    })
  }

  const confirmDeletePlay = () => {
    setPlays(plays.filter((p) => p.id !== confirmDelete.playId))
    setConfirmDelete({ isOpen: false, playId: "" })
  }

  const toggleExpanded = (playId: string) => {
    const newExpanded = new Set(expandedPlays)
    if (newExpanded.has(playId)) {
      newExpanded.delete(playId)
    } else {
      newExpanded.add(playId)
    }
    setExpandedPlays(newExpanded)
  }

  const addCustomPlayType = () => {
    if (newPlayType.trim() && !allPlayTypes.includes(newPlayType.trim())) {
      setCustomPlayTypes([...customPlayTypes, newPlayType.trim()])
      setNewPlayType("")
      setShowAddPlayType(false)
    }
  }

  const removeCustomPlayType = (typeToRemove: string) => {
    setConfirmDeleteType({
      isOpen: true,
      playType: typeToRemove,
    })
  }

  const confirmDeletePlayType = () => {
    setCustomPlayTypes(customPlayTypes.filter((type) => type !== confirmDeleteType.playType))
    setConfirmDeleteType({ isOpen: false, playType: "" })
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

  const filteredPlays = plays.filter((play) => {
    const matchesSituation = !selectedSituation || selectedSituation === "all" || play.situationId === selectedSituation
    const matchesFormation = !filterFormation || play.formation.toLowerCase().includes(filterFormation.toLowerCase())
    const matchesPlayType = !filterPlayType || filterPlayType === "all" || play.playType === filterPlayType
    const matchesPersonnel = !filterPersonnel || play.personnel.toLowerCase().includes(filterPersonnel.toLowerCase())
    const matchesTags = !filterTags || play.tags.some((tag) => tag.toLowerCase().includes(filterTags.toLowerCase()))

    return matchesSituation && matchesFormation && matchesPlayType && matchesPersonnel && matchesTags
  })

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="situationFilter">Situation</Label>
            <Select value={selectedSituation} onValueChange={setSelectedSituation}>
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
            <Label htmlFor="formationFilter">Formation</Label>
            <Input
              id="formationFilter"
              placeholder="Filter by formation..."
              value={filterFormation}
              onChange={(e) => setFilterFormation(e.target.value)}
            />
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

          <div>
            <Label htmlFor="personnelFilter">Personnel</Label>
            <Input
              id="personnelFilter"
              placeholder="Filter by personnel..."
              value={filterPersonnel}
              onChange={(e) => setFilterPersonnel(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tagFilter">Tags</Label>
            <Input
              id="tagFilter"
              placeholder="Filter by tags..."
              value={filterTags}
              onChange={(e) => setFilterTags(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredPlays.length} of {plays.length} plays
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedSituation("")
                setFilterFormation("")
                setFilterPlayType("")
                setFilterPersonnel("")
                setFilterTags("")
              }}
            >
              Clear Filters
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Play
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
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
                      {editingPlay ? "Update" : "Create"} Play
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Custom Play Types Management */}
        {customPlayTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Custom Play Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {customPlayTypes.map((type) => (
                  <Badge key={type} variant="outline" className="flex items-center gap-1">
                    {type}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      onClick={() => removeCustomPlayType(type)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Compact Play Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlays.map((play) => {
          const situation = situations.find((s) => s.id === play.situationId)
          const isExpanded = expandedPlays.has(play.id)
          return (
            <Card key={play.id} className="relative">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900">{play.formation}</div>
                    <div className="font-medium text-base text-gray-700 mt-1">{play.name}</div>
                    <div className="mt-2">
                      <Badge className={getPlayTypeColor(play.playType)}>{play.playType.toUpperCase()}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button size="sm" variant="ghost" onClick={() => toggleExpanded(play.id)}>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(play)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(play.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Collapsible open={isExpanded}>
                  <CollapsibleContent className="space-y-3">
                    {situation && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">SITUATION:</span>
                        <p className="text-sm text-gray-700">{situation.name}</p>
                      </div>
                    )}

                    {play.personnel && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">PERSONNEL:</span>
                        <p className="text-sm text-gray-700">{play.personnel}</p>
                      </div>
                    )}

                    {play.description && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">DESCRIPTION:</span>
                        <p className="text-sm text-gray-700">{play.description}</p>
                      </div>
                    )}

                    {play.tags.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">TAGS:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {play.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {play.notes && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">NOTES:</span>
                        <p className="text-sm text-gray-700">{play.notes}</p>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPlays.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No plays found for the selected criteria.</p>
          <p className="text-sm">Create your first play to get started!</p>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={confirmDeletePlay}
        title="Delete Play"
        description="Are you sure you want to delete this play? This action cannot be undone."
      />

      <ConfirmationDialog
        isOpen={confirmDeleteType.isOpen}
        onClose={() => setConfirmDeleteType({ ...confirmDeleteType, isOpen: false })}
        onConfirm={confirmDeletePlayType}
        title="Delete Play Type"
        description={`Are you sure you want to delete the "${confirmDeleteType.playType}" play type? This action cannot be undone.`}
      />
    </div>
  )
}
