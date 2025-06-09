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
import { Plus, Edit, Trash2, GripVertical } from "lucide-react"
import { ConfirmationDialog } from "./ui/confirmation-dialog"
import type { Situation } from "../page"

interface SituationsManagerProps {
  situations: Situation[]
  setSituations: (situations: Situation[]) => void
}

export function SituationsManager({ situations, setSituations }: SituationsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSituation, setEditingSituation] = useState<Situation | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    down: 1,
    distance: 10,
    fieldPosition: "",
    timeRemaining: "",
    score: "",
    description: "",
  })

  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)

  // Confirmation dialog state
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; situationId: string }>({
    isOpen: false,
    situationId: "",
  })

  const handleDragStart = (e: React.DragEvent, situationId: string) => {
    setDraggedItem(situationId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, situationId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverItem(situationId)
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()

    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const draggedIndex = situations.findIndex((s) => s.id === draggedItem)
    const targetIndex = situations.findIndex((s) => s.id === targetId)

    const newSituations = [...situations]
    const [removed] = newSituations.splice(draggedIndex, 1)
    newSituations.splice(targetIndex, 0, removed)

    setSituations(newSituations)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      down: 1,
      distance: 10,
      fieldPosition: "",
      timeRemaining: "",
      score: "",
      description: "",
    })
    setEditingSituation(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingSituation) {
      setSituations(situations.map((s) => (s.id === editingSituation.id ? { ...editingSituation, ...formData } : s)))
    } else {
      const newSituation: Situation = {
        id: Date.now().toString(),
        ...formData,
      }
      setSituations([...situations, newSituation])
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (situation: Situation) => {
    setEditingSituation(situation)
    setFormData({
      name: situation.name,
      down: situation.down,
      distance: situation.distance,
      fieldPosition: situation.fieldPosition,
      timeRemaining: situation.timeRemaining || "",
      score: situation.score || "",
      description: situation.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      situationId: id,
    })
  }

  const confirmDeleteSituation = () => {
    setSituations(situations.filter((s) => s.id !== confirmDelete.situationId))
    setConfirmDelete({ isOpen: false, situationId: "" })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Current Situations</h3>
          <p className="text-sm text-gray-600 mt-1">Drag and drop to reorder situations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Situation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSituation ? "Edit Situation" : "Create New Situation"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Situation Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 3rd & Long"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="down">Down</Label>
                  <Select
                    value={formData.down.toString()}
                    onValueChange={(value) => setFormData({ ...formData, down: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Down</SelectItem>
                      <SelectItem value="2">2nd Down</SelectItem>
                      <SelectItem value="3">3rd Down</SelectItem>
                      <SelectItem value="4">4th Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="distance">Distance</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: Number.parseInt(e.target.value) })}
                    min="1"
                    max="99"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fieldPosition">Field Position</Label>
                <Input
                  id="fieldPosition"
                  value={formData.fieldPosition}
                  onChange={(e) => setFormData({ ...formData, fieldPosition: e.target.value })}
                  placeholder="e.g., Own 25, Red Zone, Midfield"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeRemaining">Time Remaining</Label>
                  <Input
                    id="timeRemaining"
                    value={formData.timeRemaining}
                    onChange={(e) => setFormData({ ...formData, timeRemaining: e.target.value })}
                    placeholder="e.g., 2:00"
                  />
                </div>

                <div>
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    placeholder="e.g., 14-7"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional context about this situation..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingSituation ? "Update" : "Create"} Situation
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {situations.map((situation) => (
          <Card
            key={situation.id}
            className={`relative cursor-move transition-all ${
              draggedItem === situation.id ? "opacity-50 scale-95" : ""
            } ${dragOverItem === situation.id ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, situation.id)}
            onDragOver={(e) => handleDragOver(e, situation.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, situation.id)}
            onDragEnd={handleDragEnd}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                  <CardTitle className="text-lg">{situation.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(situation)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(situation.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {situation.down}
                  {situation.down === 1 ? "st" : situation.down === 2 ? "nd" : situation.down === 3 ? "rd" : "th"} &{" "}
                  {situation.distance}
                </Badge>
                {situation.fieldPosition && <Badge variant="outline">{situation.fieldPosition}</Badge>}
              </div>

              {(situation.timeRemaining || situation.score) && (
                <div className="flex gap-2 text-sm text-gray-600">
                  {situation.timeRemaining && <span>Time: {situation.timeRemaining}</span>}
                  {situation.score && <span>Score: {situation.score}</span>}
                </div>
              )}

              {situation.description && <p className="text-sm text-gray-600">{situation.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={confirmDeleteSituation}
        title="Delete Situation"
        description="Are you sure you want to delete this situation? This may affect plays that use this situation."
      />
    </div>
  )
}
