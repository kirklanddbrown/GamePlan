interface GamePlanPlay {
  id: string
  name: string
  formation: string
  concept: string
  tags?: string[]
}

interface GamePlanSection {
  id: string
  title: string
  plays: GamePlanPlay[]
  priority: "high" | "medium" | "low"
  installStatus: "not-started" | "in-progress" | "completed"
}

interface GamePlanData {
  id: string
  week: number
  opponent: string
  date: string
  sections: GamePlanSection[]
}

// Add this helper function at the top after the interfaces
const getSafeDate = (week?: number): string => {
  try {
    if (!week || isNaN(week) || week < 1) {
      return new Date().toISOString().split("T")[0]
    }

    const baseDate = new Date("2024-01-15")
    if (isNaN(baseDate.getTime())) {
      return new Date().toISOString().split("T")[0]
    }

    baseDate.setDate(baseDate.getDate() + (week - 1) * 7)

    if (isNaN(baseDate.getTime())) {
      return new Date().toISOString().split("T")[0]
    }

    return baseDate.toISOString().split("T")[0]
  } catch (error) {
    console.error("Error generating safe date:", error)
    return new Date().toISOString().split("T")[0]
  }
}

// Store for game plan data with sections and plays
const gamePlanDataStore: Record<string, GamePlanData> = {}

// Default sections that every game plan should have
const getDefaultSections = (): GamePlanSection[] => [
  { id: "1st-10", title: "1st & 10", plays: [], priority: "medium", installStatus: "in-progress" },
  { id: "2nd-long", title: "2nd & Long", plays: [], priority: "medium", installStatus: "in-progress" },
  { id: "3rd-short", title: "3rd & Short", plays: [], priority: "medium", installStatus: "in-progress" },
  { id: "3rd-medium", title: "3rd & Medium", plays: [], priority: "medium", installStatus: "in-progress" },
  { id: "3rd-long", title: "3rd & Long", plays: [], priority: "medium", installStatus: "in-progress" },
  { id: "red-zone", title: "Red Zone", plays: [], priority: "medium", installStatus: "in-progress" },
  { id: "goal-line", title: "Goal Line", plays: [], priority: "medium", installStatus: "in-progress" },
  { id: "two-minute", title: "2 Minute Drill", plays: [], priority: "medium", installStatus: "in-progress" },
]

// Get game plan data for a specific game plan
export const getGamePlanData = (gamePlanId: string): GamePlanData | null => {
  return gamePlanDataStore[gamePlanId] || null
}

// Save game plan data
export const saveGamePlanData = (gamePlanData: GamePlanData): void => {
  gamePlanDataStore[gamePlanData.id] = gamePlanData
  console.log("Game plan data saved:", gamePlanData)
}

// Update the initializeGamePlanData function to use safe date:
export const initializeGamePlanData = (
  gamePlanId: string,
  week: number,
  opponent: string,
  date?: string,
): GamePlanData => {
  if (!gamePlanDataStore[gamePlanId]) {
    const newGamePlanData: GamePlanData = {
      id: gamePlanId,
      week: week || 1,
      opponent: opponent || "TBD",
      date: date || getSafeDate(week),
      sections: getDefaultSections(),
    }
    gamePlanDataStore[gamePlanId] = newGamePlanData
    console.log("Initialized new game plan data:", newGamePlanData)
  }
  return gamePlanDataStore[gamePlanId]
}

// Update a specific section in a game plan
export const updateGamePlanSection = (gamePlanId: string, sectionId: string, updatedSection: GamePlanSection): void => {
  const gamePlanData = gamePlanDataStore[gamePlanId]
  if (gamePlanData) {
    gamePlanData.sections = gamePlanData.sections.map((section) =>
      section.id === sectionId ? updatedSection : section,
    )
    gamePlanDataStore[gamePlanId] = gamePlanData
    console.log("Updated game plan section:", sectionId, updatedSection)
  }
}

// Add play to a section
export const addPlayToSection = (gamePlanId: string, sectionId: string, play: GamePlanPlay): void => {
  const gamePlanData = gamePlanDataStore[gamePlanId]
  if (gamePlanData) {
    const section = gamePlanData.sections.find((s) => s.id === sectionId)
    if (section) {
      section.plays = [...section.plays, play]
      gamePlanDataStore[gamePlanId] = gamePlanData
      console.log("Added play to section:", sectionId, play)
    }
  }
}

// Remove play from a section
export const removePlayFromSection = (gamePlanId: string, sectionId: string, playId: string): void => {
  const gamePlanData = gamePlanDataStore[gamePlanId]
  if (gamePlanData) {
    const section = gamePlanData.sections.find((s) => s.id === sectionId)
    if (section) {
      section.plays = section.plays.filter((play) => play.id !== playId)
      gamePlanDataStore[gamePlanId] = gamePlanData
      console.log("Removed play from section:", sectionId, playId)
    }
  }
}

// Update section install status
export const updateSectionInstallStatus = (
  gamePlanId: string,
  sectionId: string,
  status: "not-started" | "in-progress" | "completed",
): void => {
  const gamePlanData = gamePlanDataStore[gamePlanId]
  if (gamePlanData) {
    const section = gamePlanData.sections.find((s) => s.id === sectionId)
    if (section) {
      section.installStatus = status
      gamePlanDataStore[gamePlanId] = gamePlanData
      console.log("Updated section install status:", sectionId, status)
    }
  }
}

// Get all game plan data (for debugging)
export const getAllGamePlanData = (): Record<string, GamePlanData> => {
  return { ...gamePlanDataStore }
}

export type { GamePlanPlay, GamePlanSection, GamePlanData }
