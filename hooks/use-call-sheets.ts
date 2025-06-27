"use client"

import { useState, useEffect } from "react"

export interface CallSheet {
  id: string
  gamePlanId: string
  opponent: string
  gameDate: string
  plays: any[]
}

export function useCallSheets() {
  const [callSheets, setCallSheets] = useState<CallSheet[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("football-call-sheets")
    if (stored) {
      try {
        setCallSheets(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading call sheets:", error)
      }
    }
  }, [])

  // Save to localStorage whenever callSheets changes
  useEffect(() => {
    localStorage.setItem("football-call-sheets", JSON.stringify(callSheets))
  }, [callSheets])

  const addCallSheet = (callSheet: CallSheet) => {
    setCallSheets((prev) => [...prev, callSheet])
  }

  const updateCallSheet = (id: string, updatedCallSheet: CallSheet) => {
    setCallSheets((prev) => prev.map((sheet) => (sheet.id === id ? updatedCallSheet : sheet)))
  }

  const deleteCallSheet = (id: string) => {
    setCallSheets((prev) => prev.filter((sheet) => sheet.id !== id))
  }

  return {
    callSheets,
    addCallSheet,
    updateCallSheet,
    deleteCallSheet,
  }
}
