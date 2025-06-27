"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useGamePlans } from "@/contexts/game-plan-context"
import { useDailyScripts } from "@/contexts/daily-script-context"
import { FileText, Plus, ArrowRight, Settings } from "lucide-react"

interface DashboardProps {
  onAction: (action: string) => void
}

export function Dashboard({ onAction }: DashboardProps) {
  const { toast } = useToast()
  const { gamePlans } = useGamePlans()
  const { dailyScripts } = useDailyScripts()
  const [upcomingGame, setUpcomingGame] = useState<any>(null)

  useEffect(() => {
    // Find the next upcoming game
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison

    const upcoming = gamePlans
      .filter((plan) => {
        const gameDate = new Date(plan.gameDate)
        gameDate.setHours(0, 0, 0, 0)
        return gameDate >= today
      })
      .sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime())[0]

    setUpcomingGame(upcoming)
  }, [gamePlans])

  const handleViewGamePlan = () => {
    onAction("view-game-plans")
    toast({ title: "Opening game plans", description: "Loading game plans section" })
  }

  const handleSettings = () => {
    toast({ title: "Settings", description: "Settings functionality coming soon!" })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Coach Dashboard</h2>
        <Button className="w-full sm:w-auto" onClick={() => onAction("create-game-plan")}>
          <Plus className="w-4 h-4 mr-2" />
          New Game Plan
        </Button>
      </div>

      {upcomingGame && (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200" key={upcomingGame?.id}>
          <CardHeader>
            <CardDescription>Upcoming Game</CardDescription>
            <CardTitle className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <span>
                Week {upcomingGame.week}: vs {upcomingGame.opponent}
              </span>
              <span className="text-base sm:text-lg">{new Date(upcomingGame.gameDate).toLocaleDateString()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Game Plan</p>
                <p className="font-medium">{upcomingGame.situations?.length || 0} Situations</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Daily Scripts</p>
                <p className="font-medium">
                  {dailyScripts.filter((script) => script.gamePlanId === upcomingGame.id).length} Created
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleViewGamePlan}>
              View Game Plan <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                Game Plans
              </CardTitle>
              <span className="text-xl sm:text-2xl font-bold text-green-600">{gamePlans.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {gamePlans.slice(0, 5).map((plan) => (
                <li
                  key={plan.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs sm:text-sm"
                >
                  <span className="truncate mr-2">
                    Week {plan.week}: vs {plan.opponent}
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(plan.gameDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
              {gamePlans.length === 0 && <li className="text-center text-gray-500 py-4">No game plans yet</li>}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs sm:text-sm"
              onClick={() => onAction("view-game-plans")}
            >
              View All Game Plans
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between items-start p-2 border-b">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">Game Plan Created</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Week 5 vs Eagles</p>
                </div>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">Today</span>
              </li>
              <li className="flex justify-between items-start p-2 border-b">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">Daily Script Updated</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Tuesday Practice - Red Zone Focus</p>
                </div>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">Yesterday</span>
              </li>
              <li className="flex justify-between items-start p-2 border-b">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">Call Sheet Generated</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Week 4 vs Tigers</p>
                </div>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">3 days ago</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 lg:gap-4">
              <Button
                className="w-full h-16 sm:h-20 lg:h-24 flex flex-col items-center justify-center gap-2 text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
                onClick={() => onAction("create-game-plan")}
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                <span className="text-center whitespace-nowrap">New Game Plan</span>
              </Button>

              <Button
                className="w-full h-16 sm:h-20 lg:h-24 flex flex-col items-center justify-center gap-2 text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                variant="outline"
                size="lg"
                onClick={handleSettings}
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                <span className="text-center whitespace-nowrap">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
