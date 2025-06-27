"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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

interface GamePlanContextType {
  gamePlans: GamePlan[]
  addGamePlan: (gamePlan: GamePlan) => void
  updateGamePlan: (id: string, updatedGamePlan: GamePlan) => void
  deleteGamePlan: (id: string) => void
}

const GamePlanContext = createContext<GamePlanContextType | undefined>(undefined)

export function GamePlanProvider({ children }: { children: React.ReactNode }) {
  const [gamePlans, setGamePlans] = useState<GamePlan[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("football-game-plans")
    if (stored) {
      try {
        const parsedPlans = JSON.parse(stored)
        setGamePlans(parsedPlans)
        console.log("Loaded game plans from localStorage:", parsedPlans)
      } catch (error) {
        console.error("Error loading game plans:", error)
      }
    }
  }, [])

  // Save to localStorage whenever gamePlans changes
  useEffect(() => {
    if (gamePlans.length > 0) {
      localStorage.setItem("football-game-plans", JSON.stringify(gamePlans))
      console.log("Saved game plans to localStorage:", gamePlans)
    }
  }, [gamePlans])

  const addGamePlan = (gamePlan: GamePlan) => {
    console.log("Adding game plan:", gamePlan)
    setGamePlans((prev) => {
      const newPlans = [...prev, gamePlan]
      console.log("New game plans array:", newPlans)
      return newPlans
    })
  }

  const updateGamePlan = (id: string, updatedGamePlan: GamePlan) => {
    setGamePlans((prev) => prev.map((plan) => (plan.id === id ? updatedGamePlan : plan)))
  }

  const deleteGamePlan = (id: string) => {
    setGamePlans((prev) => prev.filter((plan) => plan.id !== id))
  }

  return (
    <GamePlanContext.Provider
      value={{
        gamePlans,
        addGamePlan,
        updateGamePlan,
        deleteGamePlan,
      }}
    >
      {children}
    </GamePlanContext.Provider>
  )
}

export function useGamePlans() {
  const context = useContext(GamePlanContext)
  if (context === undefined) {
    throw new Error("useGamePlans must be used within a GamePlanProvider")
  }
  return context
}
