"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { motion } from "framer-motion"
import { 
  Ticket, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Tag, 
  Box,
  GitBranch,
  ExternalLink,
  Search,
  Filter,
  MoreVertical
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

const mockTickets = [
  {
    key: "PROJ-2147",
    summary: "NullPointerException in OrderService.processOrder() during guest checkout",
    status: "Open",
    priority: "P1",
    assignee: "backend-team",
    created: new Date(Date.now() - 1000 * 60 * 30),
    analysisId: "1",
    labels: ["bug", "backend", "guest-checkout", "null-pointer"],
    components: ["Order Service", "Checkout Flow"],
  },
  {
    key: "PROJ-2146",
    summary: "OutOfMemoryError in DataProcessor - loads entire 2GB CSV into memory",
    status: "In Progress",
    priority: "P0",
    assignee: "jane.dev",
    created: new Date(Date.now() - 1000 * 60 * 60 * 2),
    analysisId: "2",
    labels: ["bug", "backend", "memory", "performance"],
    components: ["Data Processor", "ETL Pipeline"],
  },
  {
    key: "PROJ-2145",
    summary: "Race Condition in CacheManager.getOrCompute() - non-atomic check-then-act",
    status: "In Review",
    priority: "P1",
    assignee: "alex.dev",
    created: new Date(Date.now() - 1000 * 60 * 60 * 24),
    analysisId: "4",
    labels: ["bug", "backend", "concurrency", "cache"],
    components: ["Cache Manager", "Core Library"],
  },
  {
    key: "PROJ-2144",
    summary: "IllegalStateException in PaymentGateway - payment used after processing",
    status: "Done",
    priority: "P2",
    assignee: "sam.dev",
    created: new Date(Date.now() - 1000 * 60 * 60 * 48),
    analysisId: "5",
    labels: ["bug", "backend", "payment", "state-machine"],
    components: ["Payment Gateway", "Billing"],
  },
  {
    key: "PROJ-2143",
    summary: "SQL Injection vulnerability in QueryBuilder - string concatenation",
    status: "Open",
    priority: "P1",
    assignee: "security-team",
    created: new Date(Date.now() - 1000 * 60 * 60 * 72),
    analysisId: "7",
    labels: ["bug", "security", "sql-injection", "backend"],
    components: ["Query Builder", "Database Layer"],
  },
]

const statusColors: Record<string, string> = {
  "Open": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "In Progress": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "In Review": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Done": "bg-green-500/10 text-green-500 border-green-500/20",
}

const priorityColors: Record<string, string> = {
  "P0": "bg-red-500/10 text-red-500 border-red-500/20",
  "P1": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "P2": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "P3": "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

export default function JiraTickets() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filteredTickets = mockTickets.filter(t => {
    const matchesSearch = t.summary.toLowerCase().includes(search.toLowerCase()) || 
                          t.key.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <main className="flex-1 ml-64 p-6 lg:ml-64 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jira Tickets</h1>
            <p className="text-muted-foreground mt-1">Tickets created from AI bug triage analyses</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Jira
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                  <p className="text-3xl font-bold mt-1">{mockTickets.length}</p>
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
                  <p className="text-3xl font-bold mt-1 text-blue-500">
                    {mockTickets.filter(t => t.status === "Open").length}
                  </p>
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
                  <p className="text-3xl font-bold mt-1 text-yellow-500">
                    {mockTickets.filter(t => t.status === "In Progress").length}
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">In Review</p>
                  <p className="text-3xl font-bold mt-1 text-purple-500">
                    {mockTickets.filter(t => t.status === "In Review").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Done</p>
                  <p className="text-3xl font-bold mt-1 text-green-500">
                    {mockTickets.filter(t => t.status === "Done").length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Key</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Summary</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Assignee</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Labels</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTickets.map((ticket, index) => (
                    <motion.tr
                      key={ticket.key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-primary">{ticket.key}</span>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="font-medium truncate">{ticket.summary}</p>
                        <p className="text-xs text-muted-foreground font-mono">Analysis #{ticket.analysisId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={statusColors[ticket.status]}>
                          {ticket.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={priorityColors[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className="text-sm">{ticket.assignee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {ticket.labels.slice(0, 3).map((label, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                          {ticket.labels.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{ticket.labels.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(ticket.created, { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredTickets.length === 0 && (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No tickets found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}