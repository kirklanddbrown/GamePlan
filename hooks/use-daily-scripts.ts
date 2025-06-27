"use client"

import { useState, useEffect } from "react"
import type { Play } from "./use-game-plans"

export interface ScriptPeriod {
  id: string
  time: string
  name: string
  focus: string
  personnel: string
  notes: string
  situationId: string
  situationName: string
  plays: Play[]
}

export interface DailyScript {
  id: string
  title: string
  date: string
  gamePlanId: string
  description: string
  opponent: string
  periods: ScriptPeriod[]
}

export function useDailyScripts() {
  const [dailyScripts, setDailyScripts] = useState<DailyScript[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("football-daily-scripts")
    if (stored) {
      try {
        setDailyScripts(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading daily scripts:", error)
      }
    }
  }, [])

  // Save to localStorage whenever dailyScripts changes
  useEffect(() => {
    localStorage.setItem("football-daily-scripts", JSON.stringify(dailyScripts))
  }, [dailyScripts])

  const addDailyScript = (script: DailyScript) => {
    setDailyScripts((prev) => [...prev, script])
  }

  const updateDailyScript = (id: string, updatedScript: DailyScript) => {
    setDailyScripts((prev) => prev.map((script) => (script.id === id ? updatedScript : script)))
  }

  const deleteDailyScript = (id: string) => {
    setDailyScripts((prev) => prev.filter((script) => script.id !== id))
  }

  return {
    dailyScripts,
    addDailyScript,
    updateDailyScript,
    deleteDailyScript,
  }
}
