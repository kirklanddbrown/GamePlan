"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Send, ThumbsUp, Reply, ChevronDown, ChevronUp } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Comment {
  id: string
  user: {
    name: string
    avatar: string
    role: string
  }
  content: string
  timestamp: string
  likes: number
  replies?: Comment[]
}

interface CollaborationPanelProps {
  target: string
  targetType: "gameplan" | "play" | "practice" | "callsheet"
}

export function CollaborationPanel({ target, targetType }: CollaborationPanelProps) {
  const currentUser = getCurrentUser()
  const [isOpen, setIsOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      user: {
        name: "Mike Smith",
        avatar: "/placeholder.svg?height=32&width=32&text=MS",
        role: "offensive-coordinator",
      },
      content:
        "I think we should consider adding a quick slant option for this situation. The Eagles tend to play aggressive coverage on 3rd down.",
      timestamp: "10 minutes ago",
      likes: 2,
      replies: [
        {
          id: "1-1",
          user: {
            name: "Coach Johnson",
            avatar: "/placeholder.svg?height=32&width=32&text=CJ",
            role: "head-coach",
          },
          content: "Good point, Mike. Let's add that to the package.",
          timestamp: "5 minutes ago",
          likes: 1,
        },
      ],
    },
    {
      id: "2",
      user: {
        name: "Sarah Davis",
        avatar: "/placeholder.svg?height=32&width=32&text=SD",
        role: "defensive-coordinator",
      },
      content:
        "From a defensive perspective, they like to bring pressure from the weak side. Might want to keep the RB in for protection.",
      timestamp: "25 minutes ago",
      likes: 3,
    },
  ])

  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          name: currentUser.name,
          avatar: currentUser.avatar || "/placeholder.svg?height=32&width=32&text=U",
          role: currentUser.role,
        },
        content: newComment,
        timestamp: "Just now",
        likes: 0,
      }

      if (replyTo) {
        setComments(comments.map((c) => (c.id === replyTo ? { ...c, replies: [...(c.replies || []), comment] } : c)))
        setReplyTo(null)
      } else {
        setComments([comment, ...comments])
      }

      setNewComment("")
    }
  }

  const handleLike = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(
        comments.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies?.map((r) => (r.id === commentId ? { ...r, likes: r.likes + 1 } : r)),
              }
            : c,
        ),
      )
    } else {
      setComments(comments.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c)))
    }
  }

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

  const unreadCount = comments.length + comments.reduce((total, comment) => total + (comment.replies?.length || 0), 0)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Collaboration</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
            <CardDescription>
              {isOpen ? `Discuss and collaborate on ${target}` : `${unreadCount} comments • Click to expand`}
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Add Comment */}
            <div className="space-y-2">
              <Textarea
                placeholder={replyTo ? "Write a reply..." : "Add a comment or suggestion..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex items-center justify-between">
                {replyTo && (
                  <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                    Cancel Reply
                  </Button>
                )}
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  {replyTo ? "Reply" : "Comment"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Comments List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {comment.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{comment.user.name}</span>
                          <Badge className={getRoleColor(comment.user.role)} variant="secondary">
                            {comment.user.role.replace("-", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleLike(comment.id)} className="h-6 px-2">
                            <ThumbsUp className="mr-1 h-3 w-3" />
                            {comment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setReplyTo(comment.id)} className="h-6 px-2">
                            <Reply className="mr-1 h-3 w-3" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.user.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {reply.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-xs">{reply.user.name}</span>
                                <Badge
                                  className={getRoleColor(reply.user.role)}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {reply.user.role.replace("-", " ")}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                              </div>
                              <p className="text-xs">{reply.content}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(reply.id, true, comment.id)}
                                className="h-5 px-1"
                              >
                                <ThumbsUp className="mr-1 h-2 w-2" />
                                {reply.likes}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
