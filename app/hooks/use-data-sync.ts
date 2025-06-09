"use client"

import { useEffect } from "react"
import type { Week, Situation, Play } from "../page"

export function useDataSync(weeks: Week[], situations: Situation[], plays: Play[]) {
  // Save weeks to backend
  useEffect(() => {
    const saveWeeks = async () => {
      try {
        await fetch("/api/data/weeks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ weeks }),
        })
      } catch (error) {
        console.error("Failed to save weeks:", error)
      }
    }

    const timeoutId = setTimeout(saveWeeks, 1000) // Debounce saves
    return () => clearTimeout(timeoutId)
  }, [weeks])

  // Save situations to backend
  useEffect(() => {
    const saveSituations = async () => {
      try {
        await fetch("/api/data/situations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ situations }),
        })
      } catch (error) {
        console.error("Failed to save situations:", error)
      }
    }

    const timeoutId = setTimeout(saveSituations, 1000)
    return () => clearTimeout(timeoutId)
  }, [situations])

  // Save plays to backend
  useEffect(() => {
    const savePlays = async () => {
      try {
        await fetch("/api/data/plays", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plays }),
        })
      } catch (error) {
        console.error("Failed to save plays:", error)
      }
    }

    const timeoutId = setTimeout(savePlays, 1000)
    return () => clearTimeout(timeoutId)
  }, [plays])
}

export async function loadUserData() {
  try {
    const [weeksRes, situationsRes, playsRes] = await Promise.all([
      fetch("/api/data/weeks"),
      fetch("/api/data/situations"),
      fetch("/api/data/plays"),
    ])

    const [weeksData, situationsData, playsData] = await Promise.all([
      weeksRes.json(),
      situationsRes.json(),
      playsRes.json(),
    ])

    return {
      weeks: weeksData.weeks || [],
      situations: situationsData.situations || [],
      plays: playsData.plays || [],
    }
  } catch (error) {
    console.error("Failed to load user data:", error)
    return {
      weeks: [],
      situations: [],
      plays: [],
    }
  }
}
