export interface User {
  id: string
  name: string
  email: string
  role: "head-coach" | "offensive-coordinator" | "defensive-coordinator" | "special-teams" | "assistant"
  avatar?: string
  teamId: string
}

export interface Team {
  id: string
  name: string
  season: string
  members: User[]
}

// Mock authentication - in real app, this would connect to your auth provider
export const getCurrentUser = (): User => ({
  id: "1",
  name: "Coach Johnson",
  email: "coach.johnson@team.com",
  role: "head-coach",
  avatar: "/placeholder.svg?height=32&width=32&text=CJ",
  teamId: "team-1",
})

export const getTeamMembers = (): User[] => [
  {
    id: "1",
    name: "Coach Johnson",
    email: "coach.johnson@team.com",
    role: "head-coach",
    avatar: "/placeholder.svg?height=32&width=32&text=CJ",
    teamId: "team-1",
  },
  {
    id: "2",
    name: "Mike Smith",
    email: "mike.smith@team.com",
    role: "offensive-coordinator",
    avatar: "/placeholder.svg?height=32&width=32&text=MS",
    teamId: "team-1",
  },
  {
    id: "3",
    name: "Sarah Davis",
    email: "sarah.davis@team.com",
    role: "defensive-coordinator",
    avatar: "/placeholder.svg?height=32&width=32&text=SD",
    teamId: "team-1",
  },
  {
    id: "4",
    name: "Tom Wilson",
    email: "tom.wilson@team.com",
    role: "special-teams",
    avatar: "/placeholder.svg?height=32&width=32&text=TW",
    teamId: "team-1",
  },
]

export const getRolePermissions = (role: string) => {
  const permissions = {
    "head-coach": ["read", "write", "delete", "manage-team", "approve"],
    "offensive-coordinator": ["read", "write", "comment"],
    "defensive-coordinator": ["read", "write", "comment"],
    "special-teams": ["read", "write", "comment"],
    assistant: ["read", "comment"],
  }
  return permissions[role as keyof typeof permissions] || ["read"]
}
