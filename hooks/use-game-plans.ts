"use client"

import { useState, useEffect } from "react"

export interface Play {
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

export interface Situation {
  id: string
  name: string
  color: string
  plays: Play[]
}

export interface GamePlan {
  id: string
  week: string
  opponent: string
  gameDate: string
  situations: Situation[]
}

export function useGamePlans() {
  const [gamePlans, setGamePlans] = useState<GamePlan[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("football-game-plans")
    if (stored) {
      try {
        setGamePlans(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading game plans:", error)
      }
    }
  }, [])

  // Save to localStorage whenever gamePlans changes
  useEffect(() => {
    localStorage.setItem("football-game-plans", JSON.stringify(gamePlans))
  }, [gamePlans])

  const addGamePlan = (gamePlan: GamePlan) => {
    setGamePlans((prev) => [...prev, gamePlan])
    setRefreshTrigger((prev) => prev + 1) // Force refresh
  }

  const updateGamePlan = (id: string, updatedGamePlan: GamePlan) => {
    setGamePlans((prev) => prev.map((plan) => (plan.id === id ? updatedGamePlan : plan)))
    setRefreshTrigger((prev) => prev + 1) // Force refresh
  }

  const deleteGamePlan = (id: string) => {
    setGamePlans((prev) => prev.filter((plan) => plan.id !== id))
    setRefreshTrigger((prev) => prev + 1) // Force refresh
  }

  return {
    gamePlans,
    addGamePlan,
    updateGamePlan,
    deleteGamePlan,
    refreshTrigger, // Export refresh trigger
  }
}
