"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Users,
  Target,
  ClipboardList,
  FileText,
  MoreHorizontal,
  Copy,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { TeamManagement } from "@/components/team-management"
import { ActivityFeed } from "@/components/activity-feed"
import { getCurrentUser } from "@/lib/auth"
import {
  getGamePlans,
  addGamePlan,
  updateGamePlan,
  deleteGamePlan,
  copyGamePlan,
  getNextAvailableWeek,
  getDateForWeek,
  type GamePlan,
} from "@/lib/gameplan-store"

export default function Dashboard() {
  const [gamePlans, setGamePlans] = useState<GamePlan[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<GamePlan | null>(null)
  const [copyingPlan, setCopyingPlan] = useState<GamePlan | null>(null)
  const [newGamePlan, setNewGamePlan] = useState<Partial<GamePlan>>({})

  const currentUser = getCurrentUser()

  // Load game plans on component mount
  useEffect(() => {
    setGamePlans(getGamePlans())
  }, [])

  // Refresh game plans data
  const refreshGamePlans = () => {
    setGamePlans(getGamePlans())
    // Trigger a custom event to update the sidebar
    window.dispatchEvent(new CustomEvent("gamePlansUpdated"))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  // Validation functions
  const isAddFormValid = () => {
    return !!(
      newGamePlan.week &&
      newGamePlan.opponent &&
      newGamePlan.opponent.trim() &&
      newGamePlan.date &&
      newGamePlan.location
    )
  }

  const isEditFormValid = () => {
    return !!(
      newGamePlan.week &&
      newGamePlan.opponent &&
      newGamePlan.opponent.trim() &&
      newGamePlan.date &&
      newGamePlan.location
    )
  }

  const isCopyFormValid = () => {
    return !!(newGamePlan.week && newGamePlan.opponent && newGamePlan.opponent.trim())
  }

  const handleAddGamePlan = () => {
    if (!isAddFormValid()) {
      console.error("Form validation failed")
      return
    }

    try {
      const gamePlan: GamePlan = {
        id: `week${newGamePlan.week}-${newGamePlan.opponent.toLowerCase().replace(/\s+/g, "")}`,
        week: newGamePlan.week!,
        opponent: newGamePlan.opponent!.trim(),
        date: newGamePlan.date!,
        location: newGamePlan.location!,
        status: "upcoming",
        weather: newGamePlan.weather?.trim() || "TBD",
        wind: newGamePlan.wind?.trim() || "TBD",
      }

      console.log("Adding game plan:", gamePlan)
      addGamePlan(gamePlan)
      refreshGamePlans()
      resetDialogs()
      console.log("Game plan added successfully")
    } catch (error) {
      console.error("Error adding game plan:", error)
    }
  }

  const handleEditGamePlan = (plan: GamePlan) => {
    setEditingPlan(plan)
    setNewGamePlan({ ...plan })
    setIsEditDialogOpen(true)
  }

  const handleUpdateGamePlan = () => {
    if (!editingPlan || !isEditFormValid()) {
      console.error("Edit form validation failed")
      return
    }

    try {
      const updatedPlan: GamePlan = {
        ...editingPlan,
        id: `week${newGamePlan.week}-${newGamePlan.opponent!.toLowerCase().replace(/\s+/g, "")}`,
        week: newGamePlan.week!,
        opponent: newGamePlan.opponent!.trim(),
        date: newGamePlan.date!,
        location: newGamePlan.location!,
        status: (newGamePlan.status as GamePlan["status"]) || editingPlan.status,
        weather: newGamePlan.weather?.trim() || editingPlan.weather,
        wind: newGamePlan.wind?.trim() || editingPlan.wind,
      }

      console.log("Updating game plan:", updatedPlan)
      updateGamePlan(updatedPlan)
      refreshGamePlans()
      resetDialogs()
      console.log("Game plan updated successfully")
    } catch (error) {
      console.error("Error updating game plan:", error)
    }
  }

  const handleCopyGamePlan = (plan: GamePlan) => {
    setCopyingPlan(plan)
    const nextWeek = getNextAvailableWeek()
    setNewGamePlan({
      week: nextWeek,
      opponent: "",
      date: getDateForWeek(nextWeek),
      location: plan.location,
      weather: plan.weather,
      wind: plan.wind,
    })
    setIsCopyDialogOpen(true)
  }

  const handleConfirmCopy = () => {
    if (!copyingPlan || !isCopyFormValid()) {
      console.error("Copy form validation failed")
      return
    }

    try {
      console.log("Copying game plan from:", copyingPlan.id)
      const copiedPlan = copyGamePlan(copyingPlan.id, newGamePlan.week!, newGamePlan.opponent!.trim())

      if (copiedPlan) {
        // Update with any custom details
        if (newGamePlan.date || newGamePlan.location || newGamePlan.weather || newGamePlan.wind) {
          const updatedCopy: GamePlan = {
            ...copiedPlan,
            date: newGamePlan.date || copiedPlan.date,
            location: newGamePlan.location || copiedPlan.location,
            weather: newGamePlan.weather?.trim() || copiedPlan.weather,
            wind: newGamePlan.wind?.trim() || copiedPlan.wind,
          }
          updateGamePlan(updatedCopy)
        }
        refreshGamePlans()
        console.log("Game plan copied successfully")
      } else {
        console.error("Failed to copy game plan")
      }
      resetDialogs()
    } catch (error) {
      console.error("Error copying game plan:", error)
    }
  }

  const handleDeleteGamePlan = (id: string) => {
    if (confirm("Are you sure you want to delete this game plan?")) {
      try {
        console.log("Deleting game plan:", id)
        deleteGamePlan(id)
        refreshGamePlans()
        console.log("Game plan deleted successfully")
      } catch (error) {
        console.error("Error deleting game plan:", error)
      }
    }
  }

  const resetDialogs = () => {
    setEditingPlan(null)
    setCopyingPlan(null)
    setNewGamePlan({})
    setIsAddDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsCopyDialogOpen(false)
  }

  const initializeAddDialog = () => {
    const nextWeek = getNextAvailableWeek()
    setNewGamePlan({
      week: nextWeek,
      opponent: "",
      date: getDateForWeek(nextWeek),
      location: "Home",
      weather: "",
      wind: "",
    })
    setIsAddDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+12 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Game Plans</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gamePlans.length}</div>
            <p className="text-xs text-muted-foreground">Active plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Scripts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">This season</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">Season average</p>
          </CardContent>
        </Card>
      </div>

      {/* Game Plans Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Weekly Game Plans</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={initializeAddDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Game Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Game Plan</DialogTitle>
                    <DialogDescription>Create a new weekly game plan</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="week">Week *</Label>
                        <Input
                          id="week"
                          type="number"
                          min="1"
                          max="20"
                          value={newGamePlan.week || ""}
                          onChange={(e) => {
                            const week = Number.parseInt(e.target.value) || 0
                            setNewGamePlan({
                              ...newGamePlan,
                              week: week > 0 ? week : undefined,
                              date: week > 0 ? getDateForWeek(week) : "",
                            })
                          }}
                          placeholder="1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="opponent">Opponent *</Label>
                        <Input
                          id="opponent"
                          value={newGamePlan.opponent || ""}
                          onChange={(e) => setNewGamePlan({ ...newGamePlan, opponent: e.target.value })}
                          placeholder="Eagles"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newGamePlan.date || ""}
                          onChange={(e) => setNewGamePlan({ ...newGamePlan, date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <Select
                          value={newGamePlan.location || ""}
                          onValueChange={(value) => setNewGamePlan({ ...newGamePlan, location: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Home">Home</SelectItem>
                            <SelectItem value="Away">Away</SelectItem>
                            <SelectItem value="Neutral">Neutral Site</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weather">Weather</Label>
                        <Input
                          id="weather"
                          value={newGamePlan.weather || ""}
                          onChange={(e) => setNewGamePlan({ ...newGamePlan, weather: e.target.value })}
                          placeholder="45°F, Clear"
                        />
                      </div>
                      <div>
                        <Label htmlFor="wind">Wind</Label>
                        <Input
                          id="wind"
                          value={newGamePlan.wind || ""}
                          onChange={(e) => setNewGamePlan({ ...newGamePlan, wind: e.target.value })}
                          placeholder="5 mph NW"
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">* Required fields</div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetDialogs}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddGamePlan} disabled={!isAddFormValid()}>
                      Add Game Plan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>Manage your upcoming and completed game plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gamePlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                    <div>
                      <p className="font-medium">
                        Week {plan.week} vs {plan.opponent}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(plan.date).toLocaleDateString()} • {plan.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/gameplan?week=${plan.week}&opponent=${plan.opponent}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditGamePlan(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyGamePlan(plan)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Game Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/practice/${plan.week}`} className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Practice Script
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/callsheet/${plan.week}`} className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Call Sheet
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteGamePlan(plan.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {gamePlans.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No game plans yet. Create your first game plan to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Welcome back, {currentUser.name}</CardTitle>
            <CardDescription>
              <Badge className="mr-2">{currentUser.role.replace("-", " ")}</Badge>
              Here's what's happening with your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/playbook">
              <Button className="w-full justify-start" variant="outline">
                <Target className="mr-2 h-4 w-4" />
                Playbook Manager
              </Button>
            </Link>
            <Link href="/gameplan">
              <Button className="w-full justify-start" variant="outline">
                <ClipboardList className="mr-2 h-4 w-4" />
                Game Plan Editor
              </Button>
            </Link>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">Access through Game Plans:</p>
              <div className="space-y-1 pl-4 border-l-2 border-muted">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-3 w-3" />
                  Practice Script
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="mr-2 h-3 w-3" />
                  Call Sheet Builder
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Game Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Game Plan</DialogTitle>
            <DialogDescription>Update game plan details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-week">Week *</Label>
                <Input
                  id="edit-week"
                  type="number"
                  min="1"
                  max="20"
                  value={newGamePlan.week || ""}
                  onChange={(e) => {
                    const week = Number.parseInt(e.target.value) || 0
                    setNewGamePlan({
                      ...newGamePlan,
                      week: week > 0 ? week : undefined,
                      date: week > 0 ? getDateForWeek(week) : newGamePlan.date,
                    })
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-opponent">Opponent *</Label>
                <Input
                  id="edit-opponent"
                  value={newGamePlan.opponent || ""}
                  onChange={(e) => setNewGamePlan({ ...newGamePlan, opponent: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Date *</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={newGamePlan.date || ""}
                  onChange={(e) => setNewGamePlan({ ...newGamePlan, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location *</Label>
                <Select
                  value={newGamePlan.location || ""}
                  onValueChange={(value) => setNewGamePlan({ ...newGamePlan, location: value })}
                  required
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={newGamePlan.status || ""}
                  onValueChange={(value) => setNewGamePlan({ ...newGamePlan, status: value as GamePlan["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-weather">Weather</Label>
                <Input
                  id="edit-weather"
                  value={newGamePlan.weather || ""}
                  onChange={(e) => setNewGamePlan({ ...newGamePlan, weather: e.target.value })}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">* Required fields</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDialogs}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGamePlan} disabled={!isEditFormValid()}>
              Update Game Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Game Plan Dialog */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Copy Game Plan</DialogTitle>
            <DialogDescription>Create a copy of "{copyingPlan?.opponent}" game plan for a new week</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="copy-week">New Week *</Label>
                <Input
                  id="copy-week"
                  type="number"
                  min="1"
                  max="20"
                  value={newGamePlan.week || ""}
                  onChange={(e) => {
                    const week = Number.parseInt(e.target.value) || 0
                    setNewGamePlan({
                      ...newGamePlan,
                      week: week > 0 ? week : undefined,
                      date: week > 0 ? getDateForWeek(week) : "",
                    })
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="copy-opponent">New Opponent *</Label>
                <Input
                  id="copy-opponent"
                  value={newGamePlan.opponent || ""}
                  onChange={(e) => setNewGamePlan({ ...newGamePlan, opponent: e.target.value })}
                  placeholder="Enter opponent name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="copy-date">Date</Label>
                <Input
                  id="copy-date"
                  type="date"
                  value={newGamePlan.date || ""}
                  onChange={(e) => setNewGamePlan({ ...newGamePlan, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="copy-location">Location</Label>
                <Select
                  value={newGamePlan.location || ""}
                  onValueChange={(value) => setNewGamePlan({ ...newGamePlan, location: value })}
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
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This will copy all plays and settings from the "{copyingPlan?.opponent}" game plan to the new week.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">* Required fields</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDialogs}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCopy} disabled={!isCopyFormValid()}>
              Copy Game Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collaboration Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <ActivityFeed />
        <TeamManagement />
      </div>
    </div>
  )
}
