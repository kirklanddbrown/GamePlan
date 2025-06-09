"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Search, Filter } from "lucide-react"
import type { Situation, Play as PlayType } from "../page"

interface CallSheetProps {
  situations: Situation[]
  plays: PlayType[]
}

interface CallSheetPlay extends PlayType {
  hash?: "L" | "R" | "M" | ""
  position?: number
}

interface SituationSection {
  situation: Situation
  plays: CallSheetPlay[]
}

export function CallSheet({ situations, plays }: CallSheetProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSituation, setFilterSituation] = useState("")
  const [filterPlayType, setFilterPlayType] = useState("")

  // Initialize situation sections with plays
  const [situationSections, setSituationSections] = useState<SituationSection[]>(() => {
    return situations.map((situation) => ({
      situation,
      plays: plays
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

  // Update when plays change
  React.useEffect(() => {
    setSituationSections((prevSections) => {
      return situations.map((situation) => {
        const existingSection = prevSections.find((s) => s.situation.id === situation.id)
        const situationPlays = plays.filter((play) => play.situationId === situation.id)

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
  }, [plays, situations])

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
          <h2 className="text-2xl font-bold">Game Day Call Sheet</h2>
          <p className="text-gray-600">Professional call sheet format - drag plays to reorder within situations</p>
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
                  <SelectItem value="run">Run</SelectItem>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
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
                    <th className="p-2 text-center w-16">Notes</th>
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

                        {/* Notes Column */}
                        <td className="p-2 text-center">
                          {play && play.notes && (
                            <div className="text-xs text-gray-600 truncate" title={play.notes}>
                              {play.notes.substring(0, 8)}
                              {play.notes.length > 8 ? "..." : ""}
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
                <span className="font-medium">Drag:</span> Click and drag formations to reorder plays
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
