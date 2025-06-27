"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2 } from "lucide-react"

interface Play {
  id: string
  number: string
  hash: string
  personnel: string
  formation: string
  motion: string
  frontBlitz: string
  coverage: string
  notes: string
}

interface Situation {
  id: string
  name: string
  color: string
  plays: Play[]
}

export function GamePlanSheet() {
  const [situations, setSituations] = useState<Situation[]>([
    {
      id: "1st-down",
      name: "1st Down (After Big Play)",
      color: "bg-green-600",
      plays: [],
    },
    {
      id: "2nd-down-short",
      name: "2nd Down (Shot & PA)",
      color: "bg-blue-600",
      plays: [],
    },
    {
      id: "2nd-down-medium",
      name: "2nd Down (Medium)",
      color: "bg-blue-500",
      plays: [],
    },
    {
      id: "2nd-down-long",
      name: "2nd Down (Long)",
      color: "bg-blue-400",
      plays: [],
    },
    {
      id: "3rd-short",
      name: "3rd and Short (0-3 Yards)",
      color: "bg-purple-600",
      plays: [],
    },
    {
      id: "3rd-medium",
      name: "3rd and Medium (4-7 Yards)",
      color: "bg-purple-500",
      plays: [],
    },
    {
      id: "3rd-long",
      name: "3rd and Long (8+ Yards)",
      color: "bg-purple-400",
      plays: [],
    },
    {
      id: "4th-down",
      name: "4th Down",
      color: "bg-orange-600",
      plays: [],
    },
    {
      id: "red-zone",
      name: "Red Zone (<25)",
      color: "bg-red-600",
      plays: [],
    },
    {
      id: "gold-zone",
      name: "Gold Zone (<10)",
      color: "bg-yellow-500",
      plays: [],
    },
    {
      id: "2pt",
      name: "2 Pt",
      color: "bg-orange-500",
      plays: [],
    },
    {
      id: "2-minute",
      name: "2 Minute Offense",
      color: "bg-blue-700",
      plays: [],
    },
    {
      id: "specials",
      name: "Specials/Wrinkles",
      color: "bg-gray-700",
      plays: [],
    },
  ])

  const [editingPlay, setEditingPlay] = useState<Play | null>(null)
  const [activeSituation, setActiveSituation] = useState(situations[0]?.id)

  const addPlay = (situationId: string) => {
    const newPlay: Play = {
      id: Date.now().toString(),
      number: "",
      hash: "",
      personnel: "",
      formation: "",
      motion: "",
      frontBlitz: "",
      coverage: "",
      notes: "",
    }

    setSituations((prev) =>
      prev.map((situation) =>
        situation.id === situationId ? { ...situation, plays: [...situation.plays, newPlay] } : situation,
      ),
    )
    setEditingPlay(newPlay)
  }

  const updatePlay = (situationId: string, playId: string, updates: Partial<Play>) => {
    setSituations((prev) =>
      prev.map((situation) =>
        situation.id === situationId
          ? {
              ...situation,
              plays: situation.plays.map((play) => (play.id === playId ? { ...play, ...updates } : play)),
            }
          : situation,
      ),
    )
  }

  const deletePlay = (situationId: string, playId: string) => {
    setSituations((prev) =>
      prev.map((situation) =>
        situation.id === situationId
          ? { ...situation, plays: situation.plays.filter((play) => play.id !== playId) }
          : situation,
      ),
    )
  }

  const currentSituation = situations.find((s) => s.id === activeSituation)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Game Plan Sheets</h2>
        <Button onClick={() => currentSituation && addPlay(currentSituation.id)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Play
        </Button>
      </div>

      <Tabs value={activeSituation} onValueChange={setActiveSituation}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1 h-auto p-1">
          {situations.map((situation) => (
            <TabsTrigger
              key={situation.id}
              value={situation.id}
              className="text-xs p-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {situation.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {situations.map((situation) => (
          <TabsContent key={situation.id} value={situation.id} className="mt-4">
            <Card>
              <CardHeader className={`${situation.color} text-white`}>
                <CardTitle className="text-center">{situation.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-sm font-medium w-12">#</th>
                        <th className="border p-2 text-sm font-medium w-12">H</th>
                        <th className="border p-2 text-sm font-medium w-12">P</th>
                        <th className="border p-2 text-sm font-medium w-24">Form</th>
                        <th className="border p-2 text-sm font-medium w-32">Motion / Play</th>
                        <th className="border p-2 text-sm font-medium w-24">Front/Blitz</th>
                        <th className="border p-2 text-sm font-medium w-24">Coverage</th>
                        <th className="border p-2 text-sm font-medium w-32">Notes</th>
                        <th className="border p-2 text-sm font-medium w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {situation.plays.map((play, index) => (
                        <tr key={play.id} className="hover:bg-gray-50">
                          <td className="border p-1">
                            <Input
                              value={play.number}
                              onChange={(e) => updatePlay(situation.id, play.id, { number: e.target.value })}
                              className="w-full text-xs border-0 p-1"
                              placeholder={`${index + 1}`}
                            />
                          </td>
                          <td className="border p-1">
                            <Select
                              value={play.hash}
                              onValueChange={(value) => updatePlay(situation.id, play.id, { hash: value })}
                            >
                              <SelectTrigger className="w-full text-xs border-0 p-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="R">R</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="border p-1">
                            <Select
                              value={play.personnel}
                              onValueChange={(value) => updatePlay(situation.id, play.id, { personnel: value })}
                            >
                              <SelectTrigger className="w-full text-xs border-0 p-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="11">11</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                                <SelectItem value="21">21</SelectItem>
                                <SelectItem value="22">22</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="border p-1">
                            <Input
                              value={play.formation}
                              onChange={(e) => updatePlay(situation.id, play.id, { formation: e.target.value })}
                              className="w-full text-xs border-0 p-1"
                              placeholder="Formation"
                            />
                          </td>
                          <td className="border p-1">
                            <Input
                              value={play.motion}
                              onChange={(e) => updatePlay(situation.id, play.id, { motion: e.target.value })}
                              className="w-full text-xs border-0 p-1"
                              placeholder="Motion / Play"
                            />
                          </td>
                          <td className="border p-1">
                            <Input
                              value={play.frontBlitz}
                              onChange={(e) => updatePlay(situation.id, play.id, { frontBlitz: e.target.value })}
                              className="w-full text-xs border-0 p-1"
                              placeholder="Front/Blitz"
                            />
                          </td>
                          <td className="border p-1">
                            <Input
                              value={play.coverage}
                              onChange={(e) => updatePlay(situation.id, play.id, { coverage: e.target.value })}
                              className="w-full text-xs border-0 p-1"
                              placeholder="Coverage"
                            />
                          </td>
                          <td className="border p-1">
                            <Input
                              value={play.notes}
                              onChange={(e) => updatePlay(situation.id, play.id, { notes: e.target.value })}
                              className="w-full text-xs border-0 p-1"
                              placeholder="Notes"
                            />
                          </td>
                          <td className="border p-1">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deletePlay(situation.id, play.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 12 - situation.plays.length) }).map((_, index) => (
                        <tr key={`empty-${index}`} className="h-8">
                          <td className="border p-1 text-center text-xs text-gray-400">
                            {situation.plays.length + index + 1}
                          </td>
                          <td className="border p-1"></td>
                          <td className="border p-1"></td>
                          <td className="border p-1"></td>
                          <td className="border p-1"></td>
                          <td className="border p-1"></td>
                          <td className="border p-1"></td>
                          <td className="border p-1"></td>
                          <td className="border p-1"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
