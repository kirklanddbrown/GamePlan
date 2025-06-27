"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface PlayTemplate {
  id: string
  number: string
  name: string
  formation: string
  motion: string
  personnel: string
  category: string
  description: string
  tags: string[]
}

interface PlayDatabaseContextType {
  playTemplates: PlayTemplate[]
  addPlayTemplate: (play: PlayTemplate) => void
  updatePlayTemplate: (id: string, updates: Partial<PlayTemplate>) => void
  deletePlayTemplate: (id: string) => void
  findPlayByName: (name: string) => PlayTemplate | undefined
  getNextPlayNumber: (category?: string) => string
}

const PlayDatabaseContext = createContext<PlayDatabaseContextType | undefined>(undefined)

export function PlayDatabaseProvider({ children }: { children: React.ReactNode }) {
  const [playTemplates, setPlayTemplates] = useState<PlayTemplate[]>([
    // Sample plays to start with
    {
      id: "play-1",
      number: "1",
      name: "Power O",
      formation: "I-Formation",
      motion: "FB Lead",
      personnel: "21",
      category: "Run",
      description: "Basic power running play",
      tags: ["run", "power", "short-yardage"],
    },
    {
      id: "play-2",
      number: "2",
      name: "Four Verticals",
      formation: "Gun Spread",
      motion: "None",
      personnel: "11",
      category: "Pass",
      description: "Four receiver vertical routes",
      tags: ["pass", "vertical", "deep"],
    },
    {
      id: "play-3",
      number: "3",
      name: "Stick Concept",
      formation: "Gun Trips",
      motion: "None",
      personnel: "11",
      category: "Pass",
      description: "Short passing concept",
      tags: ["pass", "short", "quick"],
    },
  ])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("football-play-database")
    if (stored) {
      try {
        setPlayTemplates(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading play database:", error)
      }
    }
  }, [])

  // Save to localStorage whenever playTemplates changes
  useEffect(() => {
    localStorage.setItem("football-play-database", JSON.stringify(playTemplates))
  }, [playTemplates])

  const addPlayTemplate = (play: PlayTemplate) => {
    setPlayTemplates((prev) => [...prev, play])
  }

  const updatePlayTemplate = (id: string, updates: Partial<PlayTemplate>) => {
    setPlayTemplates((prev) => prev.map((play) => (play.id === id ? { ...play, ...updates } : play)))
  }

  const deletePlayTemplate = (id: string) => {
    setPlayTemplates((prev) => prev.filter((play) => play.id !== id))
  }

  const findPlayByName = (name: string) => {
    return playTemplates.find((play) => play.name.toLowerCase() === name.toLowerCase())
  }

  const getNextPlayNumber = (category?: string) => {
    const categoryPlays = category
      ? playTemplates.filter((play) => play.category.toLowerCase() === category.toLowerCase())
      : playTemplates

    const numbers = categoryPlays.map((play) => Number.parseInt(play.number)).filter((num) => !isNaN(num))
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
    return (maxNumber + 1).toString()
  }

  return (
    <PlayDatabaseContext.Provider
      value={{
        playTemplates,
        addPlayTemplate,
        updatePlayTemplate,
        deletePlayTemplate,
        findPlayByName,
        getNextPlayNumber,
      }}
    >
      {children}
    </PlayDatabaseContext.Provider>
  )
}

export function usePlayDatabase() {
  const context = useContext(PlayDatabaseContext)
  if (context === undefined) {
    throw new Error("usePlayDatabase must be used within a PlayDatabaseProvider")
  }
  return context
}
