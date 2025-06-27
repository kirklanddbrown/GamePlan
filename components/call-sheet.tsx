"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Printer } from "lucide-react"

interface CallSheetPlay {
  situation: string
  formation: string
  play: string
  personnel: string
  hash: string
  notes: string
}

export function CallSheet() {
  const [selectedPlays, setSelectedPlays] = useState<CallSheetPlay[]>([
    {
      situation: "1st Down",
      formation: "Gun Trips",
      play: "Stick Concept",
      personnel: "11",
      hash: "R",
      notes: "Hot route vs blitz",
    },
    {
      situation: "2nd & Medium",
      formation: "I-Form",
      play: "Power O",
      personnel: "21",
      hash: "L",
      notes: "Check protection",
    },
    {
      situation: "3rd & Short",
      formation: "Gun Bunch",
      play: "Slant Flat",
      personnel: "11",
      hash: "M",
      notes: "Quick game",
    },
  ])

  const [gameInfo, setGameInfo] = useState({
    opponent: "",
    date: "",
    weather: "",
    field: "",
  })

  const situationColors: Record<string, string> = {
    "1st Down": "bg-green-100 text-green-800",
    "2nd Down": "bg-blue-100 text-blue-800",
    "3rd Down": "bg-purple-100 text-purple-800",
    "4th Down": "bg-orange-100 text-orange-800",
    "Red Zone": "bg-red-100 text-red-800",
    "Goal Line": "bg-yellow-100 text-yellow-800",
    "2 Minute": "bg-indigo-100 text-indigo-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Game Day Call Sheet</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Opponent</label>
              <Select
                value={gameInfo.opponent}
                onValueChange={(value) => setGameInfo((prev) => ({ ...prev, opponent: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select opponent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eagles">Eagles</SelectItem>
                  <SelectItem value="hawks">Hawks</SelectItem>
                  <SelectItem value="tigers">Tigers</SelectItem>
                  <SelectItem value="lions">Lions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={gameInfo.date}
                onChange={(e) => setGameInfo((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Weather</label>
              <Select
                value={gameInfo.weather}
                onValueChange={(value) => setGameInfo((prev) => ({ ...prev, weather: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Clear</SelectItem>
                  <SelectItem value="cloudy">Cloudy</SelectItem>
                  <SelectItem value="rain">Rain</SelectItem>
                  <SelectItem value="wind">Windy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Field</label>
              <Select
                value={gameInfo.field}
                onValueChange={(value) => setGameInfo((prev) => ({ ...prev, field: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grass">Grass</SelectItem>
                  <SelectItem value="turf">Turf</SelectItem>
                  <SelectItem value="wet">Wet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Reference Plays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedPlays.map((play, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={situationColors[play.situation] || "bg-gray-100 text-gray-800"}>
                      {play.situation}
                    </Badge>
                    <div>
                      <div className="font-medium text-sm">
                        {play.formation} - {play.play}
                      </div>
                      <div className="text-xs text-gray-600">
                        {play.personnel} Personnel • Hash: {play.hash}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 max-w-32 truncate">{play.notes}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Situational Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Red Zone (Inside 20)</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Fade routes to corners</li>
                  <li>• Power run game</li>
                  <li>• Quick slants underneath</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">2 Minute Drill</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• No huddle tempo</li>
                  <li>• Sideline routes</li>
                  <li>• Clock management</li>
                </ul>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">3rd Down</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Know the sticks</li>
                  <li>• Hot routes vs pressure</li>
                  <li>• Possession concepts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Play Progression Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-sm font-medium">Formation</th>
                  <th className="border p-2 text-sm font-medium">Base Run</th>
                  <th className="border p-2 text-sm font-medium">Base Run w/ Motion</th>
                  <th className="border p-2 text-sm font-medium">PA off Run</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2 font-medium">Gun Trips</td>
                  <td className="border p-2">Inside Zone</td>
                  <td className="border p-2">Jet Sweep</td>
                  <td className="border p-2">Stick Concept</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">I-Formation</td>
                  <td className="border p-2">Power O</td>
                  <td className="border p-2">Counter</td>
                  <td className="border p-2">Play Action Boot</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">Gun Spread</td>
                  <td className="border p-2">Draw</td>
                  <td className="border p-2">RPO Slant</td>
                  <td className="border p-2">Four Verticals</td>
                </tr>
                <tr>
                  <td className="border p-2 font-medium">Pistol</td>
                  <td className="border p-2">Outside Zone</td>
                  <td className="border p-2">Read Option</td>
                  <td className="border p-2">Smash Concept</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
