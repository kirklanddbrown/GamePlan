"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, MessageSquare, Calendar, Bell, Video } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { TeamManagement } from "@/components/team-management"
import { ActivityFeed } from "@/components/activity-feed"
import { getTeamMembers, getCurrentUser } from "@/lib/auth"

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  attendees: string[]
  type: "planning" | "review" | "strategy"
}

export default function TeamCollaboration() {
  const currentUser = getCurrentUser()
  const teamMembers = getTeamMembers()

  const [meetings] = useState<Meeting[]>([
    {
      id: "1",
      title: "Eagles Game Plan Review",
      date: "2024-01-12",
      time: "2:00 PM",
      attendees: ["1", "2", "3"],
      type: "review",
    },
    {
      id: "2",
      title: "Weekly Strategy Meeting",
      date: "2024-01-15",
      time: "10:00 AM",
      attendees: ["1", "2", "3", "4"],
      type: "strategy",
    },
  ])

  const [notifications] = useState([
    {
      id: "1",
      message: "Mike Smith commented on 3rd Down Package",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: "2",
      message: "Sarah Davis approved Red Zone Defense",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      message: "New practice script ready for review",
      time: "2 hours ago",
      read: true,
    },
  ])

  const getOnlineStatus = (userId: string) => {
    // Mock online status - in real app, this would be real-time
    return Math.random() > 0.5
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h2 className="text-3xl font-bold tracking-tight">Team Collaboration</h2>
        </div>
        <Button>
          <Video className="mr-2 h-4 w-4" />
          Start Meeting
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {teamMembers.filter((m) => getOnlineStatus(m.id)).length} online now
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Discussions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">3 need your attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{meetings.length}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{notifications.filter((n) => !n.read).length}</div>
                <p className="text-xs text-muted-foreground">Unread</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ActivityFeed />
            <Card>
              <CardHeader>
                <CardTitle>Team Status</CardTitle>
                <CardDescription>Current online status of coaching staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                              getOnlineStatus(member.id) ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.role.replace("-", " ")}</div>
                        </div>
                      </div>
                      <Badge variant={getOnlineStatus(member.id) ? "default" : "secondary"}>
                        {getOnlineStatus(member.id) ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Schedule and manage team meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{meeting.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{meeting.type}</Badge>
                        <span className="text-xs text-muted-foreground">{meeting.attendees.length} attendees</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button size="sm">
                        <Video className="mr-2 h-4 w-4" />
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Stay updated with team activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border rounded-lg ${!notification.read ? "bg-blue-50 border-blue-200" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Settings</CardTitle>
              <CardDescription>Configure your team collaboration preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notifications">Email Notifications</Label>
                <Select defaultValue="important">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All notifications</SelectItem>
                    <SelectItem value="important">Important only</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="auto-save">Auto-save Frequency</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Every minute</SelectItem>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="10">Every 10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="real-time" defaultChecked />
                <Label htmlFor="real-time">Enable real-time collaboration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="version-history" defaultChecked />
                <Label htmlFor="version-history">Keep version history</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
