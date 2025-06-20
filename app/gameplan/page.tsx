"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Save,
  Users,
  FileText,
  Plus,
  Eye,
  Download,
  Printer,
  X,
  Trash2,
  Calendar,
  ClipboardList,
  BookOpen,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CollaborationPanel } from "@/components/collaboration-panel"
import { getCurrentUser, getRolePermissions } from "@/lib/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { getPlaybook, convertToGamePlanPlay } from "@/lib/playbook-store"
import {
  getGamePlanData,
  saveGamePlanData,
  initializeGamePlanData,
  addPlayToSection,
  removePlayFromSection,
  type GamePlanPlay,
  type GamePlanSection,
  type GamePlanData,
} from "@/lib/gameplan-data-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface GamePlan {
  id: string
  week: number
  opponent: string
  date: string
  location: string
  weather?: string
}

interface PlayEntry {
  id: string
  hash: string
  personnel: string
  formation: string
  motionPlay: string
  frontBlitz: string
  coverage: string
  notes: string
}

export default function GamePlanEditor() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get URL parameters once and memoize them
  const urlParams = useMemo(() => {
    const week = searchParams.get("week")
    const opponent = searchParams.get("opponent")
    return { week, opponent }
  }, [searchParams])

  // Initialize game plan with default or URL values
  const [currentGamePlan, setCurrentGamePlan] = useState<GamePlan>(() => {
    const week = urlParams.week ? Number.parseInt(urlParams.week) : 1
    const opponent = urlParams.opponent || "Eagles"

    return {
      id: `week${week}-${opponent.toLowerCase()}`,
      week: week,
      opponent: opponent,
      date: getDateForWeek(week),
      location: "Home",
      weather: "45°F, Clear",
    }
  })

  // Load available plays from the shared playbook
  const [availablePlays, setAvailablePlays] = useState<GamePlanPlay[]>([])
  const [gamePlanSections, setGamePlanSections] = useState<GamePlanSection[]>([])
  const [activeSections, setActiveSections] = useState<string[]>(["1st-10"])
  const [currentSectionTab, setCurrentSectionTab] = useState<string>("1st-10")
  const [activeMainTab, setActiveMainTab] = useState("situations")
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false)
  const [newPlay, setNewPlay] = useState<Partial<PlayEntry>>({})
  const [customFormation, setCustomFormation] = useState("")
  const [customPersonnel, setCustomPersonnel] = useState("")
  const [showCustomFormation, setShowCustomFormation] = useState(false)
  const [showCustomPersonnel, setShowCustomPersonnel] = useState(false)
  const [playbookSortBy, setPlaybookSortBy] = useState<"name" | "formation" | "concept">("name")
  const [playbookSortOrder, setPlaybookSortOrder] = useState<"asc" | "desc">("asc")

  const currentUser = getCurrentUser()
  const userPermissions = getRolePermissions(currentUser.role)
  const canEdit = userPermissions.includes("write")
  const canApprove = userPermissions.includes("approve")

  // Helper function to get date for week
  function getDateForWeek(week: number): string {
    const baseDate = new Date("2024-01-15")
    baseDate.setDate(baseDate.getDate() + (week - 1) * 7)
    return baseDate.toISOString().split("T")[0]
  }

  // Load plays from playbook on component mount
  useEffect(() => {
    const playbookPlays = getPlaybook()
    const gamePlanPlays = playbookPlays.map(convertToGamePlanPlay)
    setAvailablePlays(gamePlanPlays)
  }, [])

  // Load or initialize game plan data
  useEffect(() => {
    if (currentGamePlan.id) {
      let gamePlanData = getGamePlanData(currentGamePlan.id)

      if (!gamePlanData) {
        // Initialize new game plan data
        gamePlanData = initializeGamePlanData(
          currentGamePlan.id,
          currentGamePlan.week,
          currentGamePlan.opponent,
          currentGamePlan.date,
        )
      }

      setGamePlanSections(gamePlanData.sections)
      console.log("Loaded game plan data:", gamePlanData)
    }
  }, [currentGamePlan.id, currentGamePlan.week, currentGamePlan.opponent, currentGamePlan.date])

  // Update game plan only when URL parameters actually change
  useEffect(() => {
    if (urlParams.week && urlParams.opponent) {
      const week = Number.parseInt(urlParams.week)
      const opponent = urlParams.opponent

      setCurrentGamePlan((prev) => {
        // Only update if values are actually different
        if (prev.week !== week || prev.opponent !== opponent) {
          return {
            id: `week${week}-${opponent.toLowerCase()}`,
            week: week,
            opponent: opponent,
            date: getDateForWeek(week),
            location: "Home",
            weather: "45°F, Clear",
          }
        }
        return prev
      })
    }
  }, [urlParams.week, urlParams.opponent])

  const handleSaveGamePlan = () => {
    const gamePlanData: GamePlanData = {
      id: currentGamePlan.id,
      week: currentGamePlan.week,
      opponent: currentGamePlan.opponent,
      date: currentGamePlan.date,
      sections: gamePlanSections,
    }

    saveGamePlanData(gamePlanData)
    console.log("Game plan saved successfully")
  }

  const handleCreatePracticeScript = () => {
    handleSaveGamePlan()
    const allPlays = gamePlanSections.flatMap((section) => section.plays)
    const gamePlanData = {
      id: currentGamePlan.id,
      sections: gamePlanSections,
      totalPlays: allPlays.length,
      opponent: currentGamePlan.opponent,
      week: currentGamePlan.week,
      date: currentGamePlan.date,
    }

    router.push(
      `/practice/create?gameplan=${currentGamePlan.id}&data=${encodeURIComponent(JSON.stringify(gamePlanData))}`,
    )
  }

  const handleExportToCallSheet = () => {
    handleSaveGamePlan()
    const gamePlanData = {
      id: currentGamePlan.id,
      sections: gamePlanSections,
      opponent: currentGamePlan.opponent,
      week: currentGamePlan.week,
      date: currentGamePlan.date,
    }

    router.push(
      `/callsheet/create?gameplan=${currentGamePlan.id}&data=${encodeURIComponent(JSON.stringify(gamePlanData))}`,
    )
  }

  const getTotalPlaysInstalled = () => {
    return gamePlanSections.reduce((total, section) => total + section.plays.length, 0)
  }

  const getRunPlays = () => {
    return gamePlanSections.reduce(
      (total, section) =>
        total +
        section.plays.filter(
          (play) =>
            play.concept.toLowerCase().includes("run") ||
            play.concept.toLowerCase().includes("power") ||
            play.concept.toLowerCase().includes("zone"),
        ).length,
      0,
    )
  }

  const getPassPlays = () => {
    return gamePlanSections.reduce(
      (total, section) =>
        total +
        section.plays.filter(
          (play) =>
            play.concept.toLowerCase().includes("pass") ||
            play.concept.toLowerCase().includes("vertical") ||
            play.concept.toLowerCase().includes("smash") ||
            play.concept.toLowerCase().includes("stick"),
        ).length,
      0,
    )
  }

  const addSection = (sectionId: string) => {
    if (!activeSections.includes(sectionId)) {
      setActiveSections([...activeSections, sectionId])
      setCurrentSectionTab(sectionId)
    }
  }

  const removeSection = (sectionId: string) => {
    const newActiveSections = activeSections.filter((id) => id !== sectionId)
    setActiveSections(newActiveSections)

    // If we're removing the current tab, switch to the first available tab
    if (currentSectionTab === sectionId && newActiveSections.length > 0) {
      setCurrentSectionTab(newActiveSections[0])
    }
  }

  const getSectionColor = (sectionId: string) => {
    const colors = {
      "1st-10": "bg-blue-500",
      "2nd-long": "bg-green-500",
      "3rd-short": "bg-yellow-500",
      "3rd-medium": "bg-orange-500",
      "3rd-long": "bg-purple-500",
      "red-zone": "bg-red-500",
      "goal-line": "bg-pink-500",
      "two-minute": "bg-indigo-500",
    }
    return colors[sectionId as keyof typeof colors] || "bg-gray-500"
  }

  const handleQuickAddPlay = () => {
    if (newPlay.formation && newPlay.motionPlay && currentSectionTab) {
      const playId = `play-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const play: GamePlanPlay = {
        id: playId,
        name: newPlay.motionPlay || "New Play",
        formation: newPlay.formation || "Shotgun",
        concept: "Quick Game",
        tags: [],
      }

      // Add to current section tab
      addPlayToSection(currentGamePlan.id, currentSectionTab, play)

      // Update local state
      setGamePlanSections((sections) =>
        sections.map((section) =>
          section.id === currentSectionTab
            ? {
                ...section,
                plays: [...section.plays, play],
              }
            : section,
        ),
      )

      setNewPlay({})
      setIsQuickAddOpen(false)
    }
  }

  const handleAddFromPlaybook = (play: GamePlanPlay) => {
    if (currentSectionTab) {
      // Create a completely unique play with new ID and timestamp
      const uniqueId = `${play.id}-copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newPlay = {
        ...play,
        id: uniqueId,
      }

      console.log("Adding play from playbook:", newPlay)
      addPlayToSection(currentGamePlan.id, currentSectionTab, newPlay)

      // Update local state
      setGamePlanSections((sections) =>
        sections.map((section) =>
          section.id === currentSectionTab
            ? {
                ...section,
                plays: [...section.plays, newPlay],
              }
            : section,
        ),
      )
    }
  }

  const handleRemovePlay = (sectionId: string, playId: string) => {
    removePlayFromSection(currentGamePlan.id, sectionId, playId)
    setGamePlanSections((sections) =>
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              plays: section.plays.filter((play) => play.id !== playId),
            }
          : section,
      ),
    )
  }

  const availableSectionOptions = [
    { id: "1st-10", title: "1st & 10" },
    { id: "2nd-long", title: "2nd & Long" },
    { id: "3rd-short", title: "3rd & Short" },
    { id: "3rd-medium", title: "3rd & Medium" },
    { id: "3rd-long", title: "3rd & Long" },
    { id: "red-zone", title: "Red Zone" },
    { id: "goal-line", title: "Goal Line" },
    { id: "two-minute", title: "2 Minute Drill" },
  ]

  const getSortedPlaybookPlays = () => {
    const sortedPlays = [...availablePlays].sort((a, b) => {
      let aValue = ""
      let bValue = ""

      switch (playbookSortBy) {
        case "name":
          aValue = a.name
          bValue = b.name
          break
        case "formation":
          aValue = a.formation
          bValue = b.formation
          break
        case "concept":
          aValue = a.concept
          bValue = b.concept
          break
      }

      const comparison = aValue.localeCompare(bValue)
      return playbookSortOrder === "asc" ? comparison : -comparison
    })

    return sortedPlays
  }

  const getCurrentSection = () => {
    return gamePlanSections.find((s) => s.id === currentSectionTab)
  }

  const getCurrentSectionTitle = () => {
    return availableSectionOptions.find((opt) => opt.id === currentSectionTab)?.title || currentSectionTab
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h1 className="text-3xl font-bold tracking-tight">Game Plans</h1>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Game Plan
        </Button>
      </div>

      {/* Game Plan Card */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                Week {currentGamePlan.week}: vs {currentGamePlan.opponent}
              </CardTitle>
              <CardDescription>Game Date: {new Date(currentGamePlan.date).toLocaleDateString()}</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Section Badges */}
          <div className="flex items-center space-x-2 mt-4">
            {activeSections.map((sectionId) => {
              const section = gamePlanSections.find((s) => s.id === sectionId)
              const sectionTitle = availableSectionOptions.find((opt) => opt.id === sectionId)?.title || sectionId
              return (
                <Badge key={sectionId} className={getSectionColor(sectionId)}>
                  {sectionTitle}: {section?.plays.length || 0} plays
                </Badge>
              )
            })}
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Editing Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Editing Game Plan: Week {currentGamePlan.week} vs {currentGamePlan.opponent}
        </h2>
        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Situation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Situation</DialogTitle>
                <DialogDescription>Select a game situation to add to your game plan</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {availableSectionOptions
                  .filter((option) => !activeSections.includes(option.id))
                  .map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        addSection(option.id)
                      }}
                    >
                      <div className={`w-4 h-4 rounded mr-3 ${getSectionColor(option.id)}`} />
                      {option.title}
                    </Button>
                  ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Quick Add Play
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Add Play</DialogTitle>
                <DialogDescription>Add a new play to {getCurrentSectionTitle()}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Formation</Label>
                    {!showCustomFormation ? (
                      <div className="flex gap-2">
                        <Select
                          value={newPlay.formation || ""}
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setShowCustomFormation(true)
                            } else {
                              setNewPlay({ ...newPlay, formation: value })
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select formation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Shotgun">Shotgun</SelectItem>
                            <SelectItem value="I-Formation">I-Formation</SelectItem>
                            <SelectItem value="Singleback">Singleback</SelectItem>
                            <SelectItem value="Pistol">Pistol</SelectItem>
                            <SelectItem value="Empty">Empty</SelectItem>
                            <SelectItem value="Trips">Trips</SelectItem>
                            <SelectItem value="custom">+ Add Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter custom formation"
                          value={customFormation}
                          onChange={(e) => setCustomFormation(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && customFormation.trim()) {
                              setNewPlay({ ...newPlay, formation: customFormation.trim() })
                              setCustomFormation("")
                              setShowCustomFormation(false)
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (customFormation.trim()) {
                              setNewPlay({ ...newPlay, formation: customFormation.trim() })
                              setCustomFormation("")
                              setShowCustomFormation(false)
                            }
                          }}
                        >
                          Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowCustomFormation(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Personnel</Label>
                    {!showCustomPersonnel ? (
                      <div className="flex gap-2">
                        <Select
                          value={newPlay.personnel || ""}
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setShowCustomPersonnel(true)
                            } else {
                              setNewPlay({ ...newPlay, personnel: value })
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select personnel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="11">11 Personnel</SelectItem>
                            <SelectItem value="12">12 Personnel</SelectItem>
                            <SelectItem value="21">21 Personnel</SelectItem>
                            <SelectItem value="22">22 Personnel</SelectItem>
                            <SelectItem value="10">10 Personnel</SelectItem>
                            <SelectItem value="13">13 Personnel</SelectItem>
                            <SelectItem value="custom">+ Add Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter custom personnel"
                          value={customPersonnel}
                          onChange={(e) => setCustomPersonnel(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && customPersonnel.trim()) {
                              setNewPlay({ ...newPlay, personnel: customPersonnel.trim() })
                              setCustomPersonnel("")
                              setShowCustomPersonnel(false)
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (customPersonnel.trim()) {
                              setNewPlay({ ...newPlay, personnel: customPersonnel.trim() })
                              setCustomPersonnel("")
                              setShowCustomPersonnel(false)
                            }
                          }}
                        >
                          Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowCustomPersonnel(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Motion / Play</Label>
                  <Input
                    value={newPlay.motionPlay || ""}
                    onChange={(e) => setNewPlay({ ...newPlay, motionPlay: e.target.value })}
                    placeholder="Enter play name (e.g., Power O, Four Verts, Slant)"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newPlay.notes || ""}
                    onChange={(e) => setNewPlay({ ...newPlay, notes: e.target.value })}
                    placeholder="Add notes about this play"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsQuickAddOpen(false)
                    setShowCustomFormation(false)
                    setShowCustomPersonnel(false)
                    setCustomFormation("")
                    setCustomPersonnel("")
                    setNewPlay({})
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleQuickAddPlay}>Add Play</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isPlaybookOpen} onOpenChange={setIsPlaybookOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Add from Playbook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add from Playbook</DialogTitle>
                <DialogDescription>
                  Select plays from your playbook to add to {getCurrentSectionTitle()}
                </DialogDescription>
              </DialogHeader>

              {/* Sorting Controls */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Sort by:</Label>
                  <Select
                    value={playbookSortBy}
                    onValueChange={(value: "name" | "formation" | "concept") => setPlaybookSortBy(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Play Name</SelectItem>
                      <SelectItem value="formation">Formation</SelectItem>
                      <SelectItem value="concept">Play Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Order:</Label>
                  <Select
                    value={playbookSortOrder}
                    onValueChange={(value: "asc" | "desc") => setPlaybookSortOrder(value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">A → Z</SelectItem>
                      <SelectItem value="desc">Z → A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">{getSortedPlaybookPlays().length} plays available</div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="grid gap-2">
                  {getSortedPlaybookPlays().map((play) => (
                    <div
                      key={play.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{play.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {play.formation} • {play.concept}
                        </div>
                        {play.tags && play.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {play.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {play.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{play.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleAddFromPlaybook(play)
                          setIsPlaybookOpen(false)
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                  {getSortedPlaybookPlays().length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No plays found in playbook. Add plays in Playbook Manager first.
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="situations" className="flex items-center space-x-2">
            <ClipboardList className="h-4 w-4" />
            <span>Situations</span>
          </TabsTrigger>
          <TabsTrigger value="scripts" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Daily Scripts</span>
          </TabsTrigger>
          <TabsTrigger value="callsheets" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Call Sheets</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="situations" className="space-y-4">
          {/* Folder-style Section Tabs */}
          <div className="flex items-center space-x-1 border-b">
            {activeSections.map((sectionId) => {
              const sectionTitle = availableSectionOptions.find((opt) => opt.id === sectionId)?.title || sectionId
              const isActive = currentSectionTab === sectionId
              return (
                <div
                  key={sectionId}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg cursor-pointer transition-colors ${
                    isActive
                      ? `${getSectionColor(sectionId)} text-white`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setCurrentSectionTab(sectionId)}
                >
                  <span className="font-medium">{sectionTitle}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-4 w-4 p-0 ${isActive ? "text-white hover:bg-white/20" : "text-muted-foreground hover:bg-muted"}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeSection(sectionId)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Current Section Content */}
          {currentSectionTab && (
            <Card
              className="border-t-4"
              style={{ borderTopColor: getSectionColor(currentSectionTab).replace("bg-", "#") }}
            >
              <CardHeader className={`${getSectionColor(currentSectionTab)} text-white`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{getCurrentSectionTitle()}</CardTitle>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {getCurrentSection()?.plays.length || 0} Plays
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead className="w-16">H</TableHead>
                      <TableHead className="w-16">P</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>Motion / Play</TableHead>
                      <TableHead>Front/Blitz</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentSection()?.plays.map((play, index) => (
                      <TableRow key={play.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Select defaultValue="1">
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select defaultValue="11">
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="11">11</SelectItem>
                              <SelectItem value="12">12</SelectItem>
                              <SelectItem value="21">21</SelectItem>
                              <SelectItem value="22">22</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{play.formation}</TableCell>
                        <TableCell>{play.name}</TableCell>
                        <TableCell>
                          <Input className="h-8" placeholder="Front/Blitz" />
                        </TableCell>
                        <TableCell>
                          <Input className="h-8" placeholder="Coverage" />
                        </TableCell>
                        <TableCell>
                          <Input className="h-8" placeholder="Notes" />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePlay(currentSectionTab, play.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!getCurrentSection()?.plays.length || getCurrentSection()?.plays.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          <div className="space-y-4">
                            <p>No plays added yet.</p>
                            <div className="flex items-center justify-center space-x-2">
                              <Button onClick={() => setIsQuickAddOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Quick Add
                              </Button>
                              <Button variant="outline" onClick={() => setIsPlaybookOpen(true)}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                From Playbook
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeSections.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No situations added</h3>
                <p className="text-muted-foreground mb-4">Add game situations to start building your game plan</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Situation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scripts">
          <Card>
            <CardHeader>
              <CardTitle>Daily Scripts</CardTitle>
              <CardDescription>Practice scripts generated from your game plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No practice scripts created yet</p>
                <Button onClick={handleCreatePracticeScript}>
                  <Users className="mr-2 h-4 w-4" />
                  Create Practice Script
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="callsheets">
          <Card>
            <CardHeader>
              <CardTitle>Call Sheets</CardTitle>
              <CardDescription>Game day call sheets for quick reference</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No call sheets created yet</p>
                <Button onClick={handleExportToCallSheet}>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Call Sheet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Playbook Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Playbook Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{getTotalPlaysInstalled()}</div>
              <div className="text-sm text-blue-600">Total Plays</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{getRunPlays()}</div>
              <div className="text-sm text-green-600">Run Plays</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{getPassPlays()}</div>
              <div className="text-sm text-purple-600">Pass Plays</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">0</div>
              <div className="text-sm text-orange-600">Custom Plays</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
        <CollaborationPanel
          target={`Week ${currentGamePlan.week} vs ${currentGamePlan.opponent}`}
          targetType="gameplan"
        />
        <Button onClick={handleSaveGamePlan} className="rounded-full h-12 w-12 p-0">
          <Save className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
