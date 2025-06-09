"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Calendar, X } from "lucide-react"
import { ConfirmationDialog } from "./ui/confirmation-dialog"

interface InstallPart {
  id: string
  name: string
}

interface InstallDate {
  id: string
  date: string
  notes?: string
}

interface InstallItem {
  dateId: string
  partId: string
  content: string
}

type InstallManagerProps = {}

export function InstallManager({}: InstallManagerProps) {
  const [installParts, setInstallParts] = useState<InstallPart[]>([
    { id: "1", name: "Formations" },
    { id: "2", name: "Motions" },
    { id: "3", name: "Run Game" },
    { id: "4", name: "Pass Game" },
    { id: "5", name: "Protections" },
  ])

  const [installDates, setInstallDates] = useState<InstallDate[]>([
    { id: "1", date: "2024-09-01", notes: "First day of install" },
    { id: "2", date: "2024-09-02", notes: "Day 2" },
    { id: "3", date: "2024-09-03", notes: "Day 3" },
  ])

  const [installItems, setInstallItems] = useState<InstallItem[]>([
    { dateId: "1", partId: "1", content: "I, Shotgun, Pistol" },
    { dateId: "1", partId: "3", content: "Inside Zone, Power" },
    { dateId: "2", partId: "2", content: "Jet, Orbit" },
    { dateId: "2", partId: "4", content: "Quick Game" },
    { dateId: "3", partId: "5", content: "Base Protection" },
  ])

  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false)
  const [isAddDateDialogOpen, setIsAddDateDialogOpen] = useState(false)
  const [newPartName, setNewPartName] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newDateNotes, setNewDateNotes] = useState("")
  const [editingCell, setEditingCell] = useState<{ dateId: string; partId: string } | null>(null)
  const [cellContent, setCellContent] = useState("")

  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    })
  }

  const handleAddPart = () => {
    if (newPartName.trim()) {
      const newPart: InstallPart = {
        id: Date.now().toString(),
        name: newPartName.trim(),
      }
      setInstallParts([...installParts, newPart])
      setNewPartName("")
      setIsAddPartDialogOpen(false)
    }
  }

  const handleAddDate = () => {
    if (newDate) {
      const newDateItem: InstallDate = {
        id: Date.now().toString(),
        date: newDate,
        notes: newDateNotes.trim() || undefined,
      }
      setInstallDates([...installDates, newDateItem])
      setNewDate("")
      setNewDateNotes("")
      setIsAddDateDialogOpen(false)
    }
  }

  const handleDeletePart = (partId: string) => {
    setConfirmationDialog({
      isOpen: true,
      title: "Delete Install Part",
      description: "Are you sure you want to delete this install part? This action cannot be undone.",
      onConfirm: () => {
        setInstallParts(installParts.filter((part) => part.id !== partId))
        setInstallItems(installItems.filter((item) => item.partId !== partId))
      },
    })
  }

  const handleDeleteDate = (dateId: string) => {
    setConfirmationDialog({
      isOpen: true,
      title: "Delete Install Date",
      description: "Are you sure you want to delete this install date? This action cannot be undone.",
      onConfirm: () => {
        setInstallDates(installDates.filter((date) => date.id !== dateId))
        setInstallItems(installItems.filter((item) => item.dateId !== dateId))
      },
    })
  }

  const getInstallItem = (dateId: string, partId: string) => {
    return installItems.find((item) => item.dateId === dateId && item.partId === partId)
  }

  const handleCellClick = (dateId: string, partId: string) => {
    const item = getInstallItem(dateId, partId)
    setEditingCell({ dateId, partId })
    setCellContent(item?.content || "")
  }

  const handleCellSave = () => {
    if (!editingCell) return

    const { dateId, partId } = editingCell
    const existingItemIndex = installItems.findIndex((item) => item.dateId === dateId && item.partId === partId)

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...installItems]
      if (cellContent.trim()) {
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          content: cellContent.trim(),
        }
      } else {
        // Remove if empty
        updatedItems.splice(existingItemIndex, 1)
      }
      setInstallItems(updatedItems)
    } else if (cellContent.trim()) {
      // Create new item
      setInstallItems([
        ...installItems,
        {
          dateId,
          partId,
          content: cellContent.trim(),
        },
      ])
    }

    setEditingCell(null)
    setCellContent("")
  }

  // Sort dates chronologically
  const sortedDates = [...installDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Installation Schedule</h3>
          <p className="text-sm text-gray-600 mt-1">Plan your installation schedule by date and part</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDateDialogOpen} onOpenChange={setIsAddDateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Add Date
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Install Date</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="e.g., First day of install"
                    value={newDateNotes}
                    onChange={(e) => setNewDateNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDate}>Add Date</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddPartDialogOpen} onOpenChange={setIsAddPartDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Install Part</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="partName">Part Name</Label>
                  <Input
                    id="partName"
                    placeholder="e.g., Formations, Motions, Run Game"
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddPartDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPart}>Add Part</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border-b border-r min-w-[120px]">Date</th>
                {installParts.map((part) => (
                  <th key={part.id} className="p-3 border-b border-r min-w-[150px] relative">
                    <div className="flex items-center justify-between">
                      <span>{part.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 absolute top-1 right-1"
                        onClick={() => handleDeletePart(part.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedDates.map((date) => (
                <tr key={date.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 border-r relative">
                    <div className="flex flex-col">
                      <span className="font-medium">{formatDate(date.date)}</span>
                      {date.notes && <span className="text-xs text-gray-500">{date.notes}</span>}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 absolute top-1 right-1"
                        onClick={() => handleDeleteDate(date.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  {installParts.map((part) => {
                    const item = getInstallItem(date.id, part.id)
                    const isEditing = editingCell?.dateId === date.id && editingCell?.partId === part.id

                    return (
                      <td
                        key={`${date.id}-${part.id}`}
                        className="p-3 border-r cursor-pointer"
                        onClick={() => !isEditing && handleCellClick(date.id, part.id)}
                      >
                        {isEditing ? (
                          <div className="flex">
                            <Input
                              value={cellContent}
                              onChange={(e) => setCellContent(e.target.value)}
                              className="min-w-[120px]"
                              autoFocus
                              onBlur={handleCellSave}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleCellSave()
                                } else if (e.key === "Escape") {
                                  setEditingCell(null)
                                  setCellContent("")
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="min-h-[32px]">{item?.content || ""}</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Empty state */}
      {(installDates.length === 0 || installParts.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          {installDates.length === 0 && (
            <p>
              No install dates added yet. Click <strong>Add Date</strong> to get started.
            </p>
          )}
          {installDates.length > 0 && installParts.length === 0 && (
            <p>
              No install parts added yet. Click <strong>Add Part</strong> to get started.
            </p>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog({ ...confirmationDialog, isOpen: false })}
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
      />
    </div>
  )
}
