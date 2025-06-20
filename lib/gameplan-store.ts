interface GamePlan {
  id: string
  week: number
  opponent: string
  date: string
  location: string
  status: "upcoming" | "completed" | "in-progress"
  weather?: string
  wind?: string
}

// Shared game plan data
let gamePlansData: GamePlan[] = [
  {
    id: "week1-eagles",
    week: 1,
    opponent: "Eagles",
    date: "2024-01-15",
    location: "Home",
    status: "upcoming",
    weather: "45°F, Clear",
    wind: "5 mph NW",
  },
  {
    id: "week2-patriots",
    week: 2,
    opponent: "Patriots",
    date: "2024-01-22",
    location: "Away",
    status: "upcoming",
    weather: "38°F, Cloudy",
    wind: "10 mph E",
  },
  {
    id: "week3-cowboys",
    week: 3,
    opponent: "Cowboys",
    date: "2024-01-29",
    location: "Home",
    status: "upcoming",
    weather: "52°F, Sunny",
    wind: "3 mph SW",
  },
  {
    id: "week4-giants",
    week: 4,
    opponent: "Giants",
    date: "2024-02-05",
    location: "Away",
    status: "upcoming",
    weather: "41°F, Rain",
    wind: "8 mph N",
  },
  {
    id: "week5-commanders",
    week: 5,
    opponent: "Commanders",
    date: "2024-02-12",
    location: "Home",
    status: "upcoming",
    weather: "47°F, Overcast",
    wind: "6 mph NE",
  },
]

// Game plan management functions
export const getGamePlans = (): GamePlan[] => {
  return [...gamePlansData].sort((a, b) => a.week - b.week)
}

export const getGamePlan = (id: string): GamePlan | undefined => {
  return gamePlansData.find((plan) => plan.id === id)
}

export const addGamePlan = (gamePlan: GamePlan): void => {
  // Validate required fields
  if (!gamePlan.week || !gamePlan.opponent || !gamePlan.date || !gamePlan.location) {
    throw new Error("Missing required fields for game plan")
  }

  // Check for duplicate week
  const existingPlan = gamePlansData.find((plan) => plan.week === gamePlan.week)
  if (existingPlan) {
    console.warn(`Game plan for week ${gamePlan.week} already exists. Replacing...`)
    gamePlansData = gamePlansData.filter((plan) => plan.week !== gamePlan.week)
  }

  gamePlansData = [...gamePlansData, gamePlan]
  console.log("Game plan added to store:", gamePlan)
}

export const updateGamePlan = (updatedGamePlan: GamePlan): void => {
  // Validate required fields
  if (!updatedGamePlan.week || !updatedGamePlan.opponent || !updatedGamePlan.date || !updatedGamePlan.location) {
    throw new Error("Missing required fields for game plan update")
  }

  const index = gamePlansData.findIndex((plan) => plan.id === updatedGamePlan.id)
  if (index === -1) {
    throw new Error(`Game plan with id ${updatedGamePlan.id} not found`)
  }

  gamePlansData = gamePlansData.map((plan) => (plan.id === updatedGamePlan.id ? updatedGamePlan : plan))
  console.log("Game plan updated in store:", updatedGamePlan)
}

export const deleteGamePlan = (gamePlanId: string): void => {
  const initialLength = gamePlansData.length
  gamePlansData = gamePlansData.filter((plan) => plan.id !== gamePlanId)

  if (gamePlansData.length === initialLength) {
    throw new Error(`Game plan with id ${gamePlanId} not found`)
  }

  console.log("Game plan deleted from store:", gamePlanId)
}

export const copyGamePlan = (sourceId: string, newWeek: number, newOpponent: string): GamePlan | null => {
  const sourcePlan = gamePlansData.find((plan) => plan.id === sourceId)
  if (!sourcePlan) {
    console.error(`Source game plan with id ${sourceId} not found`)
    return null
  }

  // Validate inputs
  if (!newWeek || !newOpponent || !newOpponent.trim()) {
    console.error("Invalid week or opponent for copy operation")
    return null
  }

  // Check for duplicate week
  const existingPlan = gamePlansData.find((plan) => plan.week === newWeek)
  if (existingPlan) {
    console.warn(`Game plan for week ${newWeek} already exists. Replacing...`)
    gamePlansData = gamePlansData.filter((plan) => plan.week !== newWeek)
  }

  const newGamePlan: GamePlan = {
    ...sourcePlan,
    id: `week${newWeek}-${newOpponent.toLowerCase().replace(/\s+/g, "")}`,
    week: newWeek,
    opponent: newOpponent.trim(),
    date: getDateForWeek(newWeek),
    status: "upcoming",
  }

  gamePlansData = [...gamePlansData, newGamePlan]
  console.log("Game plan copied:", newGamePlan)
  return newGamePlan
}

export const getNextAvailableWeek = (): number => {
  if (gamePlansData.length === 0) return 1

  const weeks = gamePlansData.map((plan) => plan.week).sort((a, b) => a - b)
  const maxWeek = Math.max(...weeks)

  // Find the first gap in the sequence
  for (let i = 1; i <= maxWeek; i++) {
    if (!weeks.includes(i)) {
      return i
    }
  }

  // No gaps found, return next week after max
  return maxWeek + 1
}

// Helper function to get date for week
export const getDateForWeek = (week: number): string => {
  if (!week || week < 1) return ""

  const baseDate = new Date("2024-01-15")
  baseDate.setDate(baseDate.getDate() + (week - 1) * 7)
  return baseDate.toISOString().split("T")[0]
}

// Get opponent and date for a specific week
export const getOpponentForWeek = (week: number): string => {
  const plan = gamePlansData.find((p) => p.week === week)
  return plan?.opponent || "TBD"
}

export const getDateForWeekFromStore = (week: number): string => {
  const plan = gamePlansData.find((p) => p.week === week)
  return plan?.date || getDateForWeek(week)
}

export type { GamePlan }
