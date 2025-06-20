"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Download, Upload } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  getPlaybook,
  addPlay,
  updatePlay,
  deletePlay,
  getFormations,
  addFormation,
  getMotions,
  addMotion,
  getPlayTypes,
  addPlayType,
  type Play,
} from "@/lib/playbook-store"

export default function PlaybookManager() {
  const [plays, setPlays] = useState<Play[]>([])
  const [formations, setFormations] = useState<string[]>([])
  const [motions, setMotions] = useState<string[]>([])
  const [playTypes, setPlayTypes] = useState<string[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterFormation, setFilterFormation] = useState("all")
  const [filterPlayType, setFilterPlayType] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPlay, setEditingPlay] = useState<Play | null>(null)
  const [newPlay, setNewPlay] = useState<Partial<Play>>({})

  // Custom input states
  const [customFormation, setCustomFormation] = useState("")
  const [customMotion, setCustomMotion] = useState("")
  const [customPlayType, setCustomPlayType] = useState("")
  const [showCustomFormation, setShowCustomFormation] = useState(false)
  const [showCustomMotion, setShowCustomMotion] = useState(false)
  const [showCustomPlayType, setShowCustomPlayType] = useState(false)

  // Load data from shared store on component mount
  useEffect(() => {
    setPlays(getPlaybook())
    setFormations(getFormations())
    setMotions(getMotions())
    setPlayTypes(getPlayTypes())
  }, [])

  const filteredPlays = plays.filter((play) => {
    const matchesSearch =
      play.playName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      play.formation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      play.motion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFormation = filterFormation === "all" || play.formation === filterFormation
    const matchesPlayType = filterPlayType === "all" || play.playType === filterPlayType
    return matchesSearch && matchesFormation && matchesPlayType
  })

  const handleAddCustomFormation = () => {
    if (customFormation.trim() && !formations.includes(customFormation.trim())) {
      addFormation(customFormation.trim())
      setFormations(getFormations())
      setNewPlay({ ...newPlay, formation: customFormation.trim() })
      setCustomFormation("")
      setShowCustomFormation(false)
    }
  }

  const handleAddCustomMotion = () => {
    if (customMotion.trim() && !motions.includes(customMotion.trim())) {
      addMotion(customMotion.trim())
      setMotions(getMotions())
      setNewPlay({ ...newPlay, motion: customMotion.trim() })
      setCustomMotion("")
      setShowCustomMotion(false)
    }
  }

  const handleAddCustomPlayType = () => {
    if (customPlayType.trim() && !playTypes.includes(customPlayType.trim())) {
      addPlayType(customPlayType.trim())
      setPlayTypes(getPlayTypes())
      setNewPlay({ ...newPlay, playType: customPlayType.trim() })
      setCustomPlayType("")
      setShowCustomPlayType(false)
    }
  }

  const handleAddPlay = () => {
    if (newPlay.formation && newPlay.motion && newPlay.playName && newPlay.playType) {
      const play: Play = {
        id: Date.now().toString(),
        formation: newPlay.formation,
        motion: newPlay.motion,
        playName: newPlay.playName,
        playType: newPlay.playType,
      }
      addPlay(play)
      setPlays(getPlaybook())
      setNewPlay({})
      setIsAddDialogOpen(false)
    }
  }

  const handleEditPlay = (play: Play) => {
    setEditingPlay(play)
    setNewPlay(play)
    setIsAddDialogOpen(true)
  }

  const handleUpdatePlay = () => {
    if (editingPlay && newPlay.formation && newPlay.motion && newPlay.playName && newPlay.playType) {
      const updatedPlay: Play = {
        ...editingPlay,
        formation: newPlay.formation,
        motion: newPlay.motion,
        playName: newPlay.playName,
        playType: newPlay.playType,
      }
      updatePlay(updatedPlay)
      setPlays(getPlaybook())
      setEditingPlay(null)
      setNewPlay({})
      setIsAddDialogOpen(false)
    }
  }

  const handleDeletePlay = (id: string) => {
    deletePlay(id)
    setPlays(getPlaybook())
  }

  const resetDialog = () => {
    setEditingPlay(null)
    setNewPlay({})
    setIsAddDialogOpen(false)
    setShowCustomFormation(false)
    setShowCustomMotion(false)
    setShowCustomPlayType(false)
    setCustomFormation("")
    setCustomMotion("")
    setCustomPlayType("")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Playbook Manager</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Play
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingPlay ? "Edit Play" : "Add New Play"}</DialogTitle>
                <DialogDescription>
                  {editingPlay ? "Update the play details" : "Create a new play for your playbook"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Formation Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="formation" className="text-right">
                    Formation
                  </Label>
                  <div className="col-span-3 space-y-2">
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
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select formation" />
                          </SelectTrigger>
                          <SelectContent>
                            {formations.map((formation) => (
                              <SelectItem key={formation} value={formation}>
                                {formation}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">+ Add Custom Formation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter custom formation"
                          value={customFormation}
                          onChange={(e) => setCustomFormation(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddCustomFormation()}
                        />
                        <Button size="sm" onClick={handleAddCustomFormation}>
                          Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowCustomFormation(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Motion Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="motion" className="text-right">
                    Motion
                  </Label>
                  <div className="col-span-3 space-y-2">
                    {!showCustomMotion ? (
                      <div className="flex gap-2">
                        <Select
                          value={newPlay.motion || ""}
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setShowCustomMotion(true)
                            } else {
                              setNewPlay({ ...newPlay, motion: value })
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select motion" />
                          </SelectTrigger>
                          <SelectContent>
                            {motions.map((motion) => (
                              <SelectItem key={motion} value={motion}>
                                {motion}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">+ Add Custom Motion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter custom motion"
                          value={customMotion}
                          onChange={(e) => setCustomMotion(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddCustomMotion()}
                        />
                        <Button size="sm" onClick={handleAddCustomMotion}>
                          Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowCustomMotion(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Play Name Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="playName" className="text-right">
                    Play Name
                  </Label>
                  <Input
                    id="playName"
                    value={newPlay.playName || ""}
                    onChange={(e) => setNewPlay({ ...newPlay, playName: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., Smash Concept"
                  />
                </div>

                {/* Play Type Field */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="playType" className="text-right">
                    Play Type
                  </Label>
                  <div className="col-span-3 space-y-2">
                    {!showCustomPlayType ? (
                      <div className="flex gap-2">
                        <Select
                          value={newPlay.playType || ""}
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setShowCustomPlayType(true)
                            } else {
                              setNewPlay({ ...newPlay, playType: value })
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select play type" />
                          </SelectTrigger>
                          <SelectContent>
                            {playTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">+ Add Custom Play Type</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter custom play type"
                          value={customPlayType}
                          onChange={(e) => setCustomPlayType(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddCustomPlayType()}
                        />
                        <Button size="sm" onClick={handleAddCustomPlayType}>
                          Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowCustomPlayType(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetDialog}>
                  Cancel
                </Button>
                <Button onClick={editingPlay ? handleUpdatePlay : handleAddPlay}>
                  {editingPlay ? "Update Play" : "Add Play"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find plays by name, formation, or motion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterFormation} onValueChange={setFilterFormation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by formation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formations</SelectItem>
                {formations.map((formation) => (
                  <SelectItem key={formation} value={formation}>
                    {formation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPlayType} onValueChange={setFilterPlayType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by play type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Play Types</SelectItem>
                {playTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plays Table */}
      <Card>
        <CardHeader>
          <CardTitle>Playbook ({filteredPlays.length} plays)</CardTitle>
          <CardDescription>Manage your team's playbook</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formation</TableHead>
                <TableHead>Motion</TableHead>
                <TableHead>Play Name</TableHead>
                <TableHead>Play Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlays.map((play) => (
                <TableRow key={play.id}>
                  <TableCell className="font-medium">{play.formation}</TableCell>
                  <TableCell>{play.motion}</TableCell>
                  <TableCell>{play.playName}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        play.playType === "Run"
                          ? "bg-green-100 text-green-800"
                          : play.playType === "Pass"
                            ? "bg-blue-100 text-blue-800"
                            : play.playType === "RPO"
                              ? "bg-purple-100 text-purple-800"
                              : play.playType === "Screen"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {play.playType}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditPlay(play)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePlay(play.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredPlays.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No plays found matching your criteria</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
