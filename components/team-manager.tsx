"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, Trophy } from "lucide-react"

interface Player {
  id: string
  name: string
  number: string
  position: string
  year: string
  unit: string[]
}

interface Team {
  id: string
  name: string
  level: string
  players: Player[]
}

export function TeamManager() {
  const [teams, setTeams] = useState<Team[]>([
    {
      id: "varsity",
      name: "Varsity",
      level: "Varsity",
      players: [
        { id: "1", name: "John Smith", number: "12", position: "QB", year: "Senior", unit: ["Offense"] },
        { id: "2", name: "Mike Johnson", number: "22", position: "RB", year: "Junior", unit: ["Offense"] },
        { id: "3", name: "Tom Wilson", number: "88", position: "WR", year: "Senior", unit: ["Offense"] },
      ],
    },
    {
      id: "jv",
      name: "JV Team",
      level: "JV",
      players: [
        { id: "4", name: "Alex Brown", number: "15", position: "QB", year: "Sophomore", unit: ["Offense"] },
        { id: "5", name: "Chris Davis", number: "25", position: "RB", year: "Sophomore", unit: ["Offense"] },
      ],
    },
  ])

  const [activeTeam, setActiveTeam] = useState("varsity")
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    number: "",
    position: "",
    year: "",
    unit: [] as string[],
  })

  const positions = ["QB", "RB", "FB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "K", "P", "LS"]
  const years = ["Freshman", "Sophomore", "Junior", "Senior"]
  const units = ["Offense", "Defense", "Special Teams"]

  const addPlayer = () => {
    if (newPlayer.name && newPlayer.number && newPlayer.position) {
      const player: Player = {
        id: Date.now().toString(),
        ...newPlayer,
      }

      setTeams((prev) =>
        prev.map((team) => (team.id === activeTeam ? { ...team, players: [...team.players, player] } : team)),
      )

      setNewPlayer({
        name: "",
        number: "",
        position: "",
        year: "",
        unit: [],
      })
    }
  }

  const currentTeam = teams.find((team) => team.id === activeTeam)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Management</h2>
        <Button onClick={addPlayer}>
          <Plus className="w-4 h-4 mr-2" />
          Add Player
        </Button>
      </div>

      <Tabs value={activeTeam} onValueChange={setActiveTeam}>
        <TabsList>
          {teams.map((team) => (
            <TabsTrigger key={team.id} value={team.id} className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              {team.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {teams.map((team) => (
          <TabsContent key={team.id} value={team.id} className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {team.name} Roster ({team.players.length} players)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">#</th>
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Position</th>
                            <th className="text-left p-2">Year</th>
                            <th className="text-left p-2">Units</th>
                          </tr>
                        </thead>
                        <tbody>
                          {team.players.map((player) => (
                            <tr key={player.id} className="border-b hover:bg-gray-50">
                              <td className="p-2 font-medium">{player.number}</td>
                              <td className="p-2">{player.name}</td>
                              <td className="p-2">
                                <Badge variant="outline">{player.position}</Badge>
                              </td>
                              <td className="p-2">{player.year}</td>
                              <td className="p-2">
                                <div className="flex gap-1">
                                  {player.unit.map((unit) => (
                                    <Badge key={unit} variant="secondary" className="text-xs">
                                      {unit}
                                    </Badge>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Player</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Player name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Number</label>
                      <Input
                        value={newPlayer.number}
                        onChange={(e) => setNewPlayer((prev) => ({ ...prev, number: e.target.value }))}
                        placeholder="Jersey number"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Position</label>
                      <Select
                        value={newPlayer.position}
                        onValueChange={(value) => setNewPlayer((prev) => ({ ...prev, position: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Year</label>
                      <Select
                        value={newPlayer.year}
                        onValueChange={(value) => setNewPlayer((prev) => ({ ...prev, year: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Units</label>
                      <div className="space-y-2">
                        {units.map((unit) => (
                          <label key={unit} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={newPlayer.unit.includes(unit)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewPlayer((prev) => ({ ...prev, unit: [...prev.unit, unit] }))
                                } else {
                                  setNewPlayer((prev) => ({ ...prev, unit: prev.unit.filter((u) => u !== unit) }))
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{unit}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Team Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Players:</span>
                        <span className="font-medium">{team.players.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Offense:</span>
                        <span className="font-medium">
                          {team.players.filter((p) => p.unit.includes("Offense")).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Defense:</span>
                        <span className="font-medium">
                          {team.players.filter((p) => p.unit.includes("Defense")).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Special Teams:</span>
                        <span className="font-medium">
                          {team.players.filter((p) => p.unit.includes("Special Teams")).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
