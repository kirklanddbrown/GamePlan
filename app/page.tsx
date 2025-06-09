"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SituationsManager } from "./components/situations-manager"
import { PlayManager } from "./components/play-manager"
import { Dashboard } from "./components/dashboard"
import { InstallManager } from "./components/install-manager"
import { WeekDetail } from "./components/week-detail"
import { LoginForm } from "./components/auth/login-form"
import { UserMenu } from "./components/auth/user-menu"
import { AuthProvider, useAuth } from "./contexts/auth-context"
import { useDataSync, loadUserData } from "./hooks/use-data-sync"
import { ClubIcon as Football } from "lucide-react"

export interface Situation {
  id: string
  name: string
  down: number
  distance: number
  fieldPosition: string
  timeRemaining?: string
  score?: string
  description?: string
}

export interface Play {
  id: string
  situationId: string
  name: string
  formation: string
  playType: string
  description: string
  personnel: string
  tags: string[]
  success?: boolean
  notes?: string
}

export interface Week {
  id: string
  opponent: string
  date: string
  location?: string
  notes?: string
  createdAt: string
  playScripts: PlayScript[]
  weekPlays: Play[]
  selectedSituations?: string[]
}

export interface PlayScript {
  id: string
  weekId: string
  name: string
  description: string
  plays: string[]
  situationId?: string
  createdAt: string
  situationsOrder?: string[]
  playOrders?: Record<string, string[]>
}

function AppContent() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<"main" | "week-detail">("main")
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  const [situations, setSituations] = useState<Situation[]>([])
  const [plays, setPlays] = useState<Play[]>([])
  const [customPlayTypes, setCustomPlayTypes] = useState<string[]>([
    "Screen",
    "Play Action",
    "RPO",
    "Bootleg",
    "Draw",
    "Sweep",
  ])
  const [weeks, setWeeks] = useState<Week[]>([])

  // Sync data with backend
  useDataSync(weeks, situations, plays)

  // Load user data when authenticated
  useEffect(() => {
    if (user && !dataLoaded) {
      loadUserData().then((data) => {
        if (data.weeks.length > 0) setWeeks(data.weeks)
        if (data.situations.length > 0) setSituations(data.situations)
        if (data.plays.length > 0) setPlays(data.plays)
        setDataLoaded(true)
      })
    }
  }, [user, dataLoaded])

  const handleWeekSelect = (week: Week) => {
    setSelectedWeek(week)
    setCurrentView("week-detail")
  }

  const handleBackToDashboard = () => {
    setCurrentView("main")
    setSelectedWeek(null)
  }

  const updateWeek = (updatedWeek: Week) => {
    setWeeks(weeks.map((w) => (w.id === updatedWeek.id ? updatedWeek : w)))
    setSelectedWeek(updatedWeek)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Football className="h-16 w-16 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (currentView === "week-detail" && selectedWeek) {
    return (
      <WeekDetail
        week={selectedWeek}
        situations={situations}
        allPlays={plays}
        onBack={handleBackToDashboard}
        onUpdateWeek={updateWeek}
        customPlayTypes={customPlayTypes}
        setCustomPlayTypes={setCustomPlayTypes}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Football className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Football Game Planner</h1>
                <p className="text-green-600 font-medium italic">"By coaches, for coaches"</p>
              </div>
            </div>
            <UserMenu />
          </div>
          <p className="text-lg text-gray-600">
            Welcome back, Coach {user.name}! Create situations, design plays, and organize your call sheet for game day
            success.
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="situations">Situations</TabsTrigger>
            <TabsTrigger value="plays">Plays</TabsTrigger>
            <TabsTrigger value="install">Install</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Game Plans</CardTitle>
                <CardDescription>
                  Manage your weekly game plans, opponents, and game-specific call sheets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dashboard weeks={weeks} setWeeks={setWeeks} onWeekSelect={handleWeekSelect} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="situations">
            <Card>
              <CardHeader>
                <CardTitle>Game Situations</CardTitle>
                <CardDescription>
                  Create and manage different game situations like down & distance, field position, and game context.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SituationsManager situations={situations} setSituations={setSituations} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plays">
            <Card>
              <CardHeader>
                <CardTitle>Play Management</CardTitle>
                <CardDescription>Design and organize plays for each situation in your playbook.</CardDescription>
              </CardHeader>
              <CardContent>
                <PlayManager
                  situations={situations}
                  plays={plays}
                  setPlays={setPlays}
                  customPlayTypes={customPlayTypes}
                  setCustomPlayTypes={setCustomPlayTypes}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="install">
            <Card>
              <CardHeader>
                <CardTitle>Installation Schedule</CardTitle>
                <CardDescription>
                  Plan your installation schedule by date and part to ensure proper progression.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InstallManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function FootballGamePlanner() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
