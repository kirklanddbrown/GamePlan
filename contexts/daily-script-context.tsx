"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface ScriptPeriod {
  id: string
  time: string
  name: string
  focus: string
  personnel: string
  notes: string
  situationId: string
  situationName: string
  // Remove the static plays array - we'll get plays dynamically from the linked situation
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

interface DailyScriptContextType {
  dailyScripts: DailyScript[]
  addDailyScript: (script: DailyScript) => void
  updateDailyScript: (id: string, updatedScript: DailyScript) => void
  deleteDailyScript: (id: string) => void
}

const DailyScriptContext = createContext<DailyScriptContextType | undefined>(undefined)

export function DailyScriptProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <DailyScriptContext.Provider
      value={{
        dailyScripts,
        addDailyScript,
        updateDailyScript,
        deleteDailyScript,
      }}
    >
      {children}
    </DailyScriptContext.Provider>
  )
}

export function useDailyScripts() {
  const context = useContext(DailyScriptContext)
  if (context === undefined) {
    throw new Error("useDailyScripts must be used within a DailyScriptProvider")
  }
  return context
}
