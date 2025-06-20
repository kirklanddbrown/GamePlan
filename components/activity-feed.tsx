"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, MessageSquare, Edit, Plus, Trash2 } from "lucide-react"

interface Activity {
  id: string
  type: "comment" | "edit" | "create" | "delete" | "approve"
  user: {
    name: string
    avatar: string
    role: string
  }
  action: string
  target: string
  timestamp: string
  details?: string
}

export function ActivityFeed() {
  const [activities] = useState<Activity[]>([
    {
      id: "1",
      type: "comment",
      user: {
        name: "Mike Smith",
        avatar: "/placeholder.svg?height=32&width=32&text=MS",
        role: "offensive-coordinator",
      },
      action: "commented on",
      target: "3rd & Medium plays",
      timestamp: "2 minutes ago",
      details: "I think we should add a quick slant option here",
    },
    {
      id: "2",
      type: "edit",
      user: {
        name: "Sarah Davis",
        avatar: "/placeholder.svg?height=32&width=32&text=SD",
        role: "defensive-coordinator",
      },
      action: "updated",
      target: "Red Zone Defense",
      timestamp: "15 minutes ago",
    },
    {
      id: "3",
      type: "create",
      user: {
        name: "Coach Johnson",
        avatar: "/placeholder.svg?height=32&width=32&text=CJ",
        role: "head-coach",
      },
      action: "created",
      target: "Eagles Game Plan",
      timestamp: "1 hour ago",
    },
    {
      id: "4",
      type: "approve",
      user: {
        name: "Coach Johnson",
        avatar: "/placeholder.svg?height=32&width=32&text=CJ",
        role: "head-coach",
      },
      action: "approved",
      target: "Special Teams Package",
      timestamp: "2 hours ago",
    },
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "edit":
        return <Edit className="h-4 w-4" />
      case "create":
        return <Plus className="h-4 w-4" />
      case "delete":
        return <Trash2 className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "comment":
        return "text-blue-500"
      case "edit":
        return "text-yellow-500"
      case "create":
        return "text-green-500"
      case "delete":
        return "text-red-500"
      case "approve":
        return "text-purple-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>Stay updated with team collaboration</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {activity.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</span>
                    <span className="font-medium text-sm">{activity.user.name}</span>
                    <span className="text-sm text-muted-foreground">{activity.action}</span>
                    <span className="font-medium text-sm">{activity.target}</span>
                  </div>
                  {activity.details && <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>}
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.user.role.replace("-", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
