"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useGamePlans } from "@/contexts/game-plan-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Download, Printer, Eye } from "lucide-react"
import { GamePlanEditor } from "@/components/game-plan-editor"

interface GamePlanManagerProps {
  triggerAction?: string | null
  onActionComplete?: () => void
}

export function GamePlanManager({ triggerAction, onActionComplete }: GamePlanManagerProps) {
  const { gamePlans, addGamePlan, deleteGamePlan } = useGamePlans()
  const { toast } = useToast()
  const [newGamePlan, setNewGamePlan] = useState({
    week: "",
    opponent: "",
    gameDate: "",
  })
  const [selectedGamePlan, setSelectedGamePlan] = useState<string | null>(null)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)

  // Handle trigger actions from dashboard
  useEffect(() => {
    if (triggerAction === "create-game-plan") {
      setIsCreatingPlan(true)
      onActionComplete?.()
    }
  }, [triggerAction, onActionComplete])

  const handleCreateGamePlan = () => {
    if (!newGamePlan.week || !newGamePlan.opponent || !newGamePlan.gameDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const id = `gp-${Date.now()}`
    const gamePlanData = {
      id,
      week: newGamePlan.week,
      opponent: newGamePlan.opponent,
      gameDate: newGamePlan.gameDate,
      situations: [], // Start with no pre-defined situations
    }

    console.log("Creating game plan:", gamePlanData)
    addGamePlan(gamePlanData)

    // Reset form
    setNewGamePlan({
      week: "",
      opponent: "",
      gameDate: "",
    })

    setIsCreatingPlan(false)
    setSelectedGamePlan(id)

    toast({
      title: "Game plan created",
      description: `Game plan for Week ${newGamePlan.week} vs ${newGamePlan.opponent} has been created. Add situations to get started.`,
    })
  }

  const handleDeleteGamePlan = (id: string) => {
    deleteGamePlan(id)
    if (selectedGamePlan === id) {
      setSelectedGamePlan(null)
    }

    toast({
      title: "Game plan deleted",
      description: "The game plan has been deleted",
    })
  }

  const handleExport = (id: string) => {
    toast({
      title: "Exporting game plan",
      description: "Your game plan is being exported",
    })
  }

  const handlePrint = (id: string) => {
    toast({
      title: "Printing game plan",
      description: "Your game plan is being sent to the printer",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Game Plans</h2>
        <Dialog open={isCreatingPlan} onOpenChange={setIsCreatingPlan}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Game Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Game Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="week">Week</Label>
                <Input
                  id="week"
                  placeholder="e.g. 1, 2, 3..."
                  value={newGamePlan.week}
                  onChange={(e) => setNewGamePlan({ ...newGamePlan, week: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  placeholder="e.g. Eagles, Tigers..."
                  value={newGamePlan.opponent}
                  onChange={(e) => setNewGamePlan({ ...newGamePlan, opponent: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gameDate">Game Date</Label>
                <Input
                  id="gameDate"
                  type="date"
                  value={newGamePlan.gameDate}
                  onChange={(e) => setNewGamePlan({ ...newGamePlan, gameDate: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateGamePlan} className="w-full">
                Create Game Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gamePlans.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600">No game plans yet</h3>
            <p className="text-gray-500 mt-2">Create your first game plan to get started</p>
            <Button className="mt-4" onClick={() => setIsCreatingPlan(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Game Plan
            </Button>
          </div>
        ) : (
          <>
            {gamePlans.map((plan) => (
              <Card key={plan.id} className={selectedGamePlan === plan.id ? "border-green-500 shadow-md" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span>
                      Week {plan.week}: vs {plan.opponent}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGamePlan(plan.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 mb-3">
                    Game Date: {new Date(plan.gameDate).toLocaleDateString()}
                  </div>

                  {plan.situations.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {plan.situations.map((situation) => (
                        <div key={situation.id} className={`text-xs px-2 py-1 rounded text-white ${situation.color}`}>
                          {situation.name}: {situation.plays.length} plays
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700">No situations added yet</p>
                      <p className="text-xs text-amber-600 mt-1">Click "View" to add situations and plays</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGamePlan(plan.id)}
                      className="flex-1 mr-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {plan.situations.length === 0 ? "Setup" : "View"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport(plan.id)} className="flex-1 mx-1">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePrint(plan.id)} className="flex-1 ml-1">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {selectedGamePlan && (
        <div className="mt-8">
          <GamePlanEditor gamePlanId={selectedGamePlan} />
        </div>
      )}
    </div>
  )
}
