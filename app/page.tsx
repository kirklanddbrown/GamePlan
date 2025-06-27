"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dashboard } from "@/components/dashboard"
import { GamePlanManager } from "@/components/game-plan-manager"
import { GamePlanProvider } from "@/contexts/game-plan-context"
import { DailyScriptProvider } from "@/contexts/daily-script-context"
import { PlayDatabaseProvider } from "@/contexts/play-database-context"
import { FileText, LayoutDashboard } from "lucide-react"

export default function FootballGamePlanner() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [triggerAction, setTriggerAction] = useState<string | null>(null)

  // Function to handle navigation and actions from dashboard
  const handleDashboardAction = (action: string) => {
    switch (action) {
      case "create-game-plan":
        setActiveTab("game-plans")
        setTriggerAction("create-game-plan")
        break
      case "view-game-plans":
        setActiveTab("game-plans")
        break
      default:
        break
    }
  }

  return (
    <PlayDatabaseProvider>
      <GamePlanProvider>
        <DailyScriptProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-green-800 text-white shadow-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <div>
                    <h1 className="text-2xl font-bold">Football Game Planner</h1>
                    <p className="text-sm text-green-100">Game planning and call sheet management system</p>
                  </div>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="game-plans" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Game Plans
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-6">
                  <Dashboard onAction={handleDashboardAction} />
                </TabsContent>

                <TabsContent value="game-plans" className="mt-6">
                  <GamePlanManager triggerAction={triggerAction} onActionComplete={() => setTriggerAction(null)} />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </DailyScriptProvider>
      </GamePlanProvider>
    </PlayDatabaseProvider>
  )
}
