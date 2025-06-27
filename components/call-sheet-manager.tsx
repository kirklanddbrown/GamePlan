"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGamePlans } from "@/contexts/game-plan-context"
import { Download, Printer, Plus } from "lucide-react"

interface CallSheetManagerProps {
  gamePlanId: string
}

interface CallSheetPlay {
  situation: string
  formation: string
  play: string
  personnel: string
  hash: string
  notes: string
}

export function CallSheetManager({ gamePlanId }: CallSheetManagerProps) {
  const { gamePlans } = useGamePlans()
  const gamePlan = gamePlans.find((plan) => plan.id === gamePlanId)

  const [selectedPlays, setSelectedPlays] = useState<CallSheetPlay[]>([])
  const [gameInfo, setGameInfo] = useState({
    weather: "",
    field: "",
  })

  if (!gamePlan) {
    return <div>Game plan not found</div>
  }

  const situationColors: Record<string, string> = {
    "1st Down": "bg-green-100 text-green-800",
    "2nd Down": "bg-blue-100 text-blue-800",
    "3rd Down": "bg-purple-100 text-purple-800",
    "4th Down": "bg-orange-100 text-orange-800",
    "Red Zone": "bg-red-100 text-red-800",
    "Goal Line": "bg-yellow-100 text-yellow-800",
    "2 Minute": "bg-indigo-100 text-indigo-800",
  }

  const addPlayToCallSheet = (situationName: string, play: any) => {
    const callSheetPlay: CallSheetPlay = {
      situation: situationName,
      formation: play.formation,
      play: play.motion,
      personnel: play.personnel,
      hash: play.hash,
      notes: play.notes,
    }
    setSelectedPlays((prev) => [...prev, callSheetPlay])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Call Sheet for Week {gamePlan.week} vs {gamePlan.opponent}
        </h2>
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
              <div className="p-2 bg-gray-50 rounded-md">{gamePlan.opponent}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <div className="p-2 bg-gray-50 rounded-md">{new Date(gamePlan.gameDate).toLocaleDateString()}</div>
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
            <CardTitle>Available Plays by Situation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gamePlan.situations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No situations created yet</p>
                  <p className="text-sm">Add situations to your game plan first</p>
                </div>
              ) : (
                gamePlan.situations.map((situation) => (
                  <div key={situation.id} className="border rounded-lg p-4">
                    <div
                      className={`inline-block px-3 py-1 rounded text-white text-sm font-medium mb-3 ${situation.color}`}
                    >
                      {situation.name} ({situation.plays.length} plays)
                    </div>
                    <div className="space-y-2">
                      {situation.plays.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">No plays in this situation yet</p>
                          <p className="text-xs">Switch to the Situations tab to add plays</p>
                        </div>
                      ) : (
                        <>
                          {situation.plays.slice(0, 3).map((play) => (
                            <div key={play.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  #{play.number} {play.formation} - {play.motion}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {play.personnel} Personnel • Hash: {play.hash}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addPlayToCallSheet(situation.name, play)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                          ))}
                          {situation.plays.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{situation.plays.length - 3} more plays available
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Sheet ({selectedPlays.length} plays)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedPlays.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No plays selected yet</p>
                  <p className="text-sm">Add plays from your situations to build your call sheet</p>
                </div>
              ) : (
                selectedPlays.map((play, index) => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Situational Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
  )
}
