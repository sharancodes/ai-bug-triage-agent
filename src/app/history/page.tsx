"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Brain, 
  AlertTriangle, 
  Zap, 
  Target, 
  Ticket, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Search,
  Filter,
  Download,
  Eye,
  Code,
  MessageSquare
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

const JIRA_BASE_URL = "https://sharanhitam.atlassian.net"

const mockAnalyses = [
  {
    id: "1",
    title: "NullPointerException in OrderService",
    file: "OrderService.java:184",
    priority: "P1",
    confidence: 92,
    severity: "High",
    time: new Date(Date.now() - 1000 * 60 * 30),
    status: "completed",
    hasTicket: true,
    ticketKey: "PROJ-2147",
    rootCause: "Customer object is null because validation was skipped during guest checkout flow",
  },
  {
    id: "2",
    title: "OutOfMemoryError in DataProcessor",
    file: "DataProcessor.java:56",
    priority: "P0",
    confidence: 87,
    severity: "Critical",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: "completed",
    hasTicket: true,
    ticketKey: "PROJ-2146",
    rootCause: "Processing large dataset without streaming - loads entire 2GB CSV into memory",
  },
  {
    id: "3",
    title: "SQLException in UserRepository",
    file: "UserRepository.java:203",
    priority: "P2",
    confidence: 78,
    severity: "Medium",
    time: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: "completed",
    hasTicket: false,
    rootCause: "Connection leak in UserRepository - connections not returned to pool after exception",
  },
  {
    id: "4",
    title: "Race Condition in CacheManager",
    file: "CacheManager.java:89",
    priority: "P1",
    confidence: 94,
    severity: "High",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "completed",
    hasTicket: true,
    ticketKey: "PROJ-2145",
    rootCause: "Non-atomic check-then-act pattern in getOrCompute() method",
  },
  {
    id: "5",
    title: "IllegalStateException in PaymentGateway",
    file: "PaymentGateway.java:142",
    priority: "P2",
    confidence: 82,
    severity: "Medium",
    time: new Date(Date.now() - 1000 * 60 * 60 * 48),
    status: "completed",
    hasTicket: true,
    ticketKey: "PROJ-2144",
    rootCause: "Payment object used after being marked as processed",
  },
  {
    id: "6",
    title: "StackOverflowError in RecursiveSerializer",
    file: "RecursiveSerializer.java:34",
    priority: "P3",
    confidence: 71,
    severity: "Low",
    time: new Date(Date.now() - 1000 * 60 * 60 * 72),
    status: "completed",
    hasTicket: false,
    rootCause: "Circular reference in object graph not handled by serializer",
  },
]

const priorityColors: Record<string, string> = {
  "P0": "bg-red-500/10 text-red-500 border-red-500/20",
  "P1": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "P2": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "P3": "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

const severityColors: Record<string, string> = {
  "Critical": "bg-red-500/10 text-red-500",
  "High": "bg-orange-500/10 text-orange-500",
  "Medium": "bg-yellow-500/10 text-yellow-500",
  "Low": "bg-green-500/10 text-green-500",
}

export default function History() {
  const [search, setSearch] = React.useState("")
  const [priorityFilter, setPriorityFilter] = React.useState("all")
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const filteredAnalyses = mockAnalyses.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                          a.file.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === "all" || a.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  return (
    <main className="flex-1 ml-64 p-6 lg:ml-64 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
            <p className="text-muted-foreground mt-1">All previous AI bug triage analyses</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Link href="/analyze">
              <Button className="gap-2">
                <Brain className="h-4 w-4" />
                New Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4 pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search analyses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="P0">P0 - Critical</SelectItem>
                  <SelectItem value="P1">P1 - High</SelectItem>
                  <SelectItem value="P2">P2 - Medium</SelectItem>
                  <SelectItem value="P3">P3 - Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
                  <p className="text-3xl font-bold mt-1">{mockAnalyses.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                  <p className="text-3xl font-bold mt-1">87%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tickets Created</p>
                  <p className="text-3xl font-bold mt-1">4</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                  <p className="text-3xl font-bold mt-1 text-red-500">1</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analyses List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Analysis</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAnalyses.map((analysis, index) => (
                    <React.Fragment key={analysis.id}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn("hover:bg-muted/50 transition-colors", expandedId === analysis.id && "bg-primary/5")}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{analysis.title}</p>
                            <p className="text-sm text-muted-foreground font-mono">{analysis.file}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={priorityColors[analysis.priority]}>
                            {analysis.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${analysis.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono text-muted-foreground w-10 text-right">{analysis.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={severityColors[analysis.severity]}>
                            {analysis.severity}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={analysis.hasTicket ? "success" : "outline"}>
                            {analysis.hasTicket ? "Ticket Created" : "No Ticket"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDistanceToNow(analysis.time, { addSuffix: true })}
                        </td>
                        <td className="px-6 py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            {analysis.hasTicket && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setExpandedId(expandedId === analysis.id ? null : analysis.id)}
                            >
                              {expandedId === analysis.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded Row */}
                      <AnimatePresence>
                        {expandedId === analysis.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td colSpan={7} className="px-6 pb-6">
                              <div className="bg-muted/30 rounded-lg p-4 mt-2 border-t">
                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="md:col-span-2 space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Root Cause</p>
                                  <p className="text-sm font-mono bg-background p-3 rounded">{analysis.rootCause}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline"><Brain className="h-3 w-3 mr-1" /> AI Confidence: {analysis.confidence}%</Badge>
                                  <Badge variant="outline"><Target className="h-3 w-3 mr-1" /> Priority: {analysis.priority}</Badge>
                                  <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" /> Severity: {analysis.severity}</Badge>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Link href={`/analyze/${analysis.id}`} className="block">
                                  <Button variant="outline" className="w-full justify-start gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </Button>
                                </Link>
                                {analysis.hasTicket && (
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => window.open(`${JIRA_BASE_URL}/browse/${analysis.ticketKey}`, "_blank")}
                                  >
                                    <Ticket className="h-4 w-4" />
                                    View Ticket: {analysis.ticketKey}
                                  </Button>
                                )}
                                {!analysis.hasTicket && (
                                  <Link href={`/analyze/${analysis.id}`} className="block">
                                    <Button variant="default" className="w-full justify-start gap-2">
                                      <Ticket className="h-4 w-4" />
                                      Create Jira Ticket
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredAnalyses.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No analyses found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ExternalLink } from "lucide-react"
