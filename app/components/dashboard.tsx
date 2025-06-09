"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, MapPin, Edit, Trash2, FolderOpen, Users } from "lucide-react"
import { ConfirmationDialog } from "./ui/confirmation-dialog"
import type { Week } from "../page"

interface DashboardProps {
  weeks: Week[]
  setWeeks: (weeks: Week[]) => void
  onWeekSelect: (week: Week) => void
}

export function Dashboard({ weeks, setWeeks, onWeekSelect }: DashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWeek, setEditingWeek] = useState<Week | null>(null)
  const [formData, setFormData] = useState({
    opponent: "",
    date: "",
    location: "Home",
    notes: "",
  })
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; weekId: string }>({
    isOpen: false,
    weekId: "",
  })

  const resetForm = () => {
    setFormData({
      opponent: "",
      date: "",
      location: "Home",
      notes: "",
    })
    setEditingWeek(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingWeek) {
      const updatedWeek: Week = {
        ...editingWeek,
        ...formData,
      }
      setWeeks(weeks.map((w) => (w.id === editingWeek.id ? updatedWeek : w)))
    } else {
      const newWeek: Week = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        playScripts: [],
        weekPlays: [],
      }
      setWeeks([...weeks, newWeek])
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (week: Week) => {
    setEditingWeek(week)
    setFormData({
      opponent: week.opponent,
      date: week.date,
      location: week.location || "Home",
      notes: week.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      weekId: id,
    })
  }

  const confirmDeleteWeek = () => {
    setWeeks(weeks.filter((w) => w.id !== confirmDelete.weekId))
    setConfirmDelete({ isOpen: false, weekId: "" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getWeekStatus = (week: Week) => {
    const gameDate = new Date(week.date)
    const today = new Date()
    const diffTime = gameDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: "completed", color: "bg-gray-100 text-gray-800" }
    if (diffDays === 0) return { status: "today", color: "bg-red-100 text-red-800" }
    if (diffDays <= 7) return { status: "this week", color: "bg-orange-100 text-orange-800" }
    return { status: "upcoming", color: "bg-green-100 text-green-800" }
  }

  const sortedWeeks = [...weeks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Game Weeks</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your weekly game plans and opponent preparation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Week
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingWeek ? "Edit Week" : "Create New Week"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  placeholder="e.g., Eagles, Cowboys, Giants"
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">Game Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Away">Away</SelectItem>
                    <SelectItem value="Neutral">Neutral Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Opponent tendencies, weather, key matchups..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingWeek ? "Update" : "Create"} Week
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Week Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedWeeks.map((week) => {
          const weekStatus = getWeekStatus(week)
          return (
            <Card
              key={week.id}
              className="relative cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onWeekSelect(week)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      vs {week.opponent}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={weekStatus.color}>{weekStatus.status}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {week.location}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(week)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(week.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDate(week.date)}
                </div>

                {week.notes && <p className="text-sm text-gray-700 line-clamp-2">{week.notes}</p>}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{week.playScripts.length} Scripts</span>
                    <span>{week.weekPlays.length} Plays</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-sm font-medium">Open</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {weeks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No weeks created yet</h3>
          <p className="text-sm mb-4">Create your first week to start planning for your upcoming games.</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Week
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={confirmDeleteWeek}
        title="Delete Week"
        description="Are you sure you want to delete this week? This will remove all associated play scripts and cannot be undone."
      />
    </div>
  )
}
