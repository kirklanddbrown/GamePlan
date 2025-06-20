"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Mail, Shield, Users } from "lucide-react"
import { getTeamMembers, getRolePermissions, type User } from "@/lib/auth"

export function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<User[]>(getTeamMembers())
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("")

  const getRoleColor = (role: string) => {
    const colors = {
      "head-coach": "bg-red-500",
      "offensive-coordinator": "bg-blue-500",
      "defensive-coordinator": "bg-green-500",
      "special-teams": "bg-purple-500",
      assistant: "bg-gray-500",
    }
    return colors[role as keyof typeof colors] || "bg-gray-500"
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      "head-coach": "Head Coach",
      "offensive-coordinator": "Offensive Coordinator",
      "defensive-coordinator": "Defensive Coordinator",
      "special-teams": "Special Teams",
      assistant: "Assistant Coach",
    }
    return labels[role as keyof typeof labels] || role
  }

  const handleInvite = () => {
    if (inviteEmail && inviteRole) {
      // In real app, this would send an invitation
      console.log(`Inviting ${inviteEmail} as ${inviteRole}`)
      setInviteEmail("")
      setInviteRole("")
      setIsInviteDialogOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Coaching Staff</span>
            </CardTitle>
            <CardDescription>Manage your team's coaching staff and permissions</CardDescription>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Coach
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Coach</DialogTitle>
                <DialogDescription>Send an invitation to join your coaching staff</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="coach@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offensive-coordinator">Offensive Coordinator</SelectItem>
                      <SelectItem value="defensive-coordinator">Defensive Coordinator</SelectItem>
                      <SelectItem value="special-teams">Special Teams Coach</SelectItem>
                      <SelectItem value="assistant">Assistant Coach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleInvite}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getRoleColor(member.role)}>{getRoleLabel(member.role)}</Badge>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>{getRolePermissions(member.role).join(", ")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
