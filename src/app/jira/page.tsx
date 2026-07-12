"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import {
  Ticket,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  ExternalLink,
  Search,
  MoreVertical,
  RefreshCw,
  Loader2,
  Plus,
  X,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

const JIRA_BASE_URL = "https://sharanhitam.atlassian.net"

const statusColors: Record<string, string> = {
  "Open": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "In Progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "In Review": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Done": "bg-green-500/10 text-green-500 border-green-500/20",
  "To Do": "bg-gray-500/10 text-gray-500 border-gray-500/20",
  "Backlog": "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const priorityColors: Record<string, string> = {
  "Highest": "bg-red-500/10 text-red-500 border-red-500/20",
  "High": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Medium": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "Low": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Lowest": "bg-green-500/10 text-green-500 border-green-500/20",
  "P0": "bg-red-500/10 text-red-500 border-red-500/20",
  "P1": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "P2": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "P3": "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

interface JiraTicket {
  id: string
  key: string
  summary: string
  status: string
  priority: string
  assignee?: string
  createdAt: string
  analysisId: string
  labels?: string
  components?: string
  project: string
  issueType: string
  description?: string
}

export default function JiraTickets() {
  const [tickets, setTickets] = React.useState<JiraTicket[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [priorityFilter, setPriorityFilter] = React.useState("all")
  const [showCreate, setShowCreate] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState("")

  const [newTicket, setNewTicket] = React.useState({
    project: "PROJ",
    issueType: "Bug",
    summary: "",
    description: "",
    priority: "Medium",
    labels: "",
  })

  const fetchTickets = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/jira")
      if (res.ok) {
        const data = await res.json()
        setTickets(data)
      }
    } catch (e) {
      console.error("Failed to fetch tickets:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.summary?.toLowerCase().includes(search.toLowerCase()) ||
      t.key?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || t.status === statusFilter
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open" || t.status === "To Do").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    done: tickets.filter((t) => t.status === "Done").length,
  }

  const handleCreate = async () => {
    if (!newTicket.summary.trim()) {
      setCreateError("Summary is required")
      return
    }
    setCreating(true)
    setCreateError("")
    try {
      const res = await fetch("/api/jira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: newTicket.project,
          issueType: newTicket.issueType,
          summary: newTicket.summary,
          description: newTicket.description,
          priority: newTicket.priority,
          labels: newTicket.labels ? newTicket.labels.split(",").map((l) => l.trim()) : [],
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreate(false)
        setNewTicket({ project: "PROJ", issueType: "Bug", summary: "", description: "", priority: "Medium", labels: "" })
        fetchTickets()
      } else {
        setCreateError(data.error || "Failed to create ticket")
      }
    } catch {
      setCreateError("Network error")
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="flex-1 ml-64 p-6 lg:ml-64 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jira Tickets</h1>
            <p className="text-muted-foreground mt-1">
              Tickets created from AI bug triage analyses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.open(JIRA_BASE_URL, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Open Jira
            </Button>
            <Button className="gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
              Create Ticket
            </Button>
          </div>
        </div>

        {/* Create Ticket Modal */}
        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Create Jira Ticket
                <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Project</Label>
                  <Select value={newTicket.project} onValueChange={(v) => setNewTicket({ ...newTicket, project: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROJ">PROJ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Issue Type</Label>
                  <Select value={newTicket.issueType} onValueChange={(v) => setNewTicket({ ...newTicket, issueType: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bug">Bug</SelectItem>
                      <SelectItem value="Task">Task</SelectItem>
                      <SelectItem value="Story">Story</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Summary *</Label>
                <Input
                  value={newTicket.summary}
                  onChange={(e) => setNewTicket({ ...newTicket, summary: e.target.value })}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Detailed description"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Highest">Highest (P0)</SelectItem>
                      <SelectItem value="High">High (P1)</SelectItem>
                      <SelectItem value="Medium">Medium (P2)</SelectItem>
                      <SelectItem value="Low">Low (P3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Labels (comma-separated)</Label>
                  <Input
                    value={newTicket.labels}
                    onChange={(e) => setNewTicket({ ...newTicket, labels: e.target.value })}
                    placeholder="bug, backend, critical"
                  />
                </div>
              </div>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {creating ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open</p>
                  <p className="text-3xl font-bold mt-1 text-blue-500">{stats.open}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-500">{stats.inProgress}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Done</p>
                  <p className="text-3xl font-bold mt-1 text-green-500">{stats.done}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Refresh</p>
                  <Button variant="ghost" size="sm" onClick={fetchTickets} className="mt-1">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Highest">Highest</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Key</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Summary</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Assignee</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTickets.map((ticket, index) => {
                      const labels = ticket.labels ? JSON.parse(ticket.labels) : []
                      return (
                        <motion.tr
                          key={ticket.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <button
                              onClick={() => window.open(`${JIRA_BASE_URL}/browse/${ticket.key}`, "_blank")}
                              className="font-mono font-medium text-primary hover:underline"
                            >
                              {ticket.key}
                            </button>
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <p className="font-medium truncate">{ticket.summary}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {ticket.issueType} · {ticket.project}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={statusColors[ticket.status] || ""}>
                              {ticket.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={priorityColors[ticket.priority] || ""}>
                              {ticket.priority}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <span className="text-sm">{ticket.assignee || "Unassigned"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                          </td>
                          <td className="px-6 py-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => window.open(`${JIRA_BASE_URL}/browse/${ticket.key}`, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>

                {filteredTickets.length === 0 && (
                  <div className="text-center py-12">
                    <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No tickets found</h3>
                    <p className="text-muted-foreground mt-1">
                      {tickets.length === 0
                        ? "No Jira tickets created yet. Run an analysis and create a ticket."
                        : "Try adjusting your search or filters"}
                    </p>
                    {tickets.length === 0 && (
                      <Button className="mt-4" onClick={() => window.open(JIRA_BASE_URL, "_blank")}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Jira
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
