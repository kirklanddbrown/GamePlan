interface Play {
  id: string
  formation: string
  motion: string
  playName: string
  playType: string
}

// Shared playbook data that both components can access
let playbookData: Play[] = [
  {
    id: "1",
    formation: "Singleback",
    motion: "None",
    playName: "Smash Concept",
    playType: "Pass",
  },
  {
    id: "2",
    formation: "I-Formation",
    motion: "None",
    playName: "Power O",
    playType: "Run",
  },
  {
    id: "3",
    formation: "Shotgun",
    motion: "Jet Motion",
    playName: "Four Verts",
    playType: "Pass",
  },
  {
    id: "4",
    formation: "Shotgun",
    motion: "None",
    playName: "Inside Zone",
    playType: "Run",
  },
  {
    id: "5",
    formation: "Shotgun",
    motion: "Orbit Motion",
    playName: "Stick Concept",
    playType: "Pass",
  },
  {
    id: "6",
    formation: "Shotgun",
    motion: "None",
    playName: "Slant",
    playType: "Pass",
  },
  {
    id: "7",
    formation: "I-Formation",
    motion: "None",
    playName: "Dive",
    playType: "Run",
  },
  {
    id: "8",
    formation: "Shotgun",
    motion: "None",
    playName: "Screen",
    playType: "Screen",
  },
  {
    id: "9",
    formation: "Singleback",
    motion: "Fly Motion",
    playName: "Play Action Boot",
    playType: "Bootleg",
  },
  {
    id: "10",
    formation: "Empty",
    motion: "None",
    playName: "Flood Concept",
    playType: "Pass",
  },
]

// Shared dropdown options
let formationsData: string[] = ["Singleback", "I-Formation", "Shotgun", "Pistol", "Wildcat", "Empty", "Trips", "Bunch"]

let motionsData: string[] = [
  "None",
  "Jet Motion",
  "Orbit Motion",
  "Fly Motion",
  "Shift",
  "Stack Motion",
  "Crack Motion",
  "Wheel Motion",
]

let playTypesData: string[] = ["Run", "Pass", "RPO", "Special", "Screen", "Draw", "Bootleg"]

// Playbook management functions
export const getPlaybook = (): Play[] => {
  return [...playbookData]
}

export const addPlay = (play: Play): void => {
  playbookData = [...playbookData, play]
}

export const updatePlay = (updatedPlay: Play): void => {
  playbookData = playbookData.map((play) => (play.id === updatedPlay.id ? updatedPlay : play))
}

export const deletePlay = (playId: string): void => {
  playbookData = playbookData.filter((play) => play.id !== playId)
}

// Dropdown options management
export const getFormations = (): string[] => {
  return [...formationsData]
}

export const addFormation = (formation: string): void => {
  if (!formationsData.includes(formation)) {
    formationsData = [...formationsData, formation]
  }
}

export const getMotions = (): string[] => {
  return [...motionsData]
}

export const addMotion = (motion: string): void => {
  if (!motionsData.includes(motion)) {
    motionsData = [...motionsData, motion]
  }
}

export const getPlayTypes = (): string[] => {
  return [...playTypesData]
}

export const addPlayType = (playType: string): void => {
  if (!playTypesData.includes(playType)) {
    playTypesData = [...playTypesData, playType]
  }
}

// Convert playbook play to game plan play format
export const convertToGamePlanPlay = (play: Play) => {
  return {
    id: play.id,
    name: play.playName,
    formation: play.formation,
    concept: getConceptFromPlayType(play.playType),
    tags: generateTagsFromPlay(play),
  }
}

// Helper function to determine concept from play type
const getConceptFromPlayType = (playType: string): string => {
  switch (playType) {
    case "Pass":
      return "Passing"
    case "Run":
      return "Running"
    case "RPO":
      return "RPO"
    case "Screen":
      return "Screen"
    case "Draw":
      return "Draw"
    case "Bootleg":
      return "Bootleg"
    case "Special":
      return "Special"
    default:
      return playType
  }
}

// Helper function to generate tags based on play characteristics
const generateTagsFromPlay = (play: Play): string[] => {
  const tags: string[] = []

  // Add formation-based tags
  if (play.formation === "Shotgun") {
    tags.push("Spread")
  }
  if (play.formation === "I-Formation") {
    tags.push("Power")
  }
  if (play.formation === "Empty") {
    tags.push("5 Wide")
  }

  // Add motion-based tags
  if (play.motion !== "None") {
    tags.push("Motion")
  }

  // Add play type tags
  if (play.playType === "Pass") {
    tags.push("Passing Game")
  }
  if (play.playType === "Run") {
    tags.push("Running Game")
  }
  if (play.playType === "Screen") {
    tags.push("Quick Game")
  }

  // Add situational tags based on play name
  if (play.playName.toLowerCase().includes("slant")) {
    tags.push("Quick Game", "Hot Route")
  }
  if (play.playName.toLowerCase().includes("fade")) {
    tags.push("Red Zone", "Goal Line")
  }
  if (play.playName.toLowerCase().includes("power")) {
    tags.push("Short Yardage", "Goal Line")
  }
  if (play.playName.toLowerCase().includes("verts")) {
    tags.push("Deep", "2 Minute")
  }
  if (play.playName.toLowerCase().includes("stick")) {
    tags.push("3rd Down", "Medium")
  }
  if (play.playName.toLowerCase().includes("smash")) {
    tags.push("Red Zone", "3rd Down")
  }

  return tags
}

export type { Play }
