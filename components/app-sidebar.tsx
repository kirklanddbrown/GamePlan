"use client"

import { useState, useEffect } from "react"
import { Home, PlayCircle, Users, ClipboardList, ChevronDown, Target } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { getGamePlans, type GamePlan } from "@/lib/gameplan-store"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Team Collaboration",
    url: "/team",
    icon: Users,
  },
  {
    title: "Playbook Manager",
    url: "/playbook",
    icon: PlayCircle,
  },
]

export function AppSidebar() {
  const [weeklySchedule, setWeeklySchedule] = useState<GamePlan[]>([])

  // Load game plans on component mount
  useEffect(() => {
    setWeeklySchedule(getGamePlans())
  }, [])

  // Listen for game plan updates from Dashboard
  useEffect(() => {
    const handleGamePlansUpdate = () => {
      setWeeklySchedule(getGamePlans())
    }

    window.addEventListener("gamePlansUpdated", handleGamePlansUpdate)
    return () => {
      window.removeEventListener("gamePlansUpdated", handleGamePlansUpdate)
    }
  }, [])

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-bold text-sidebar-foreground">Football Coach Pro</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Weekly Game Plans */}
        <SidebarGroup>
          <SidebarGroupLabel>Weekly Game Plans</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {weeklySchedule.length > 0 ? (
                weeklySchedule.map((week) => (
                  <Collapsible key={week.id} className="group/week">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <ClipboardList />
                          <span>
                            Week {week.week} vs {week.opponent}
                          </span>
                          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/week:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href={`/gameplan?week=${week.week}&opponent=${week.opponent}`}>
                                <Target className="h-3 w-3" />
                                <span>Game Plan Editor</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href={`/practice/${week.week}`}>
                                <Users className="h-3 w-3" />
                                <span>Practice Script</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href={`/callsheet/${week.week}`}>
                                <ClipboardList className="h-3 w-3" />
                                <span>Call Sheet</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <ClipboardList />
                    <span>No game plans yet</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-sidebar-foreground/60">© 2024 Football Coach Pro</div>
      </SidebarFooter>
    </Sidebar>
  )
}
