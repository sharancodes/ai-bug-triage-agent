"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Bug, 
  AlertTriangle, 
  Zap, 
  Target, 
  Ticket, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Brain,
  CheckCircle,
  XCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

const statCards = [
  { name: "Bugs Analyzed", value: "124", change: "+12%", trend: "up", icon: Bug, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Avg Confidence", value: "92%", change: "+5%", trend: "up", icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
  { name: "Critical Bugs", value: "18", change: "+3", trend: "down", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  { name: "Tickets Created", value: "89", change: "+7%", trend: "up", icon: Ticket, color: "text-purple-500", bg: "bg-purple-500/10" },
]

const recentAnalyses = [
  {
    id: "1",
    title: "NullPointerException in OrderService",
    file: "OrderService.java:184",
    priority: "P1",
    confidence: 92,
    time: new Date(Date.now() - 1000 * 60 * 30),
    status: "completed",
  },
  {
    id: "2",
    title: "OutOfMemoryError in DataProcessor",
    file: "DataProcessor.java:56",
    priority: "P0",
    confidence: 87,
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: "completed",
  },
  {
    id: "3",
    title: "SQLException in UserRepository",
    file: "UserRepository.java:203",
    priority: "P2",
    confidence: 78,
    time: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: "completed",
  },
  {
    id: "4",
    title: "Race Condition in CacheManager",
    file: "CacheManager.java:89",
    priority: "P1",
    confidence: 94,
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "completed",
  },
]

const priorityColors: Record<string, string> = {
  "P0": "bg-red-500/10 text-red-500 border-red-500/20",
  "P1": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "P2": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "P3": "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

export default function Dashboard() {
  return (
    <main className="flex-1 ml-64 p-6 lg:ml-64 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of AI bug triage activity</p>
          </div>
          <Link href="/analyze">
            <Button size="lg" className="gap-2">
              <Brain className="h-4 w-4" />
              Analyze New Bug
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={stat.trend === "up" ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}>
                          {stat.trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {stat.change}
                        </Badge>
                        <span className="text-xs text-muted-foreground">vs last week</span>
                      </div>
                    </div>
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Confidence Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Confidence Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-grid-pattern rounded-lg relative">
                  {/* Simple SVG chart */}
                  <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,180 L40,160 L80,140 L120,120 L160,100 L200,90 L240,85 L280,80 L320,75 L360,70 L400,65"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      fill="url(#confidenceGradient)"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <g stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4,4">
                      <line x1="0" y1="60" x2="400" y2="60" />
                      <line x1="0" y1="120" x2="400" y2="120" />
                      <line x1="0" y1="180" x2="400" y2="180" />
                    </g>
                  </svg>
                  <div className="absolute bottom-4 right-4 flex gap-4 text-xs text-muted-foreground">
                    <span>90%</span>
                    <span>95%</span>
                    <span>98%</span>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/analyze" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Analyze New Bug</p>
                      <p className="text-xs text-muted-foreground">Upload logs, stack traces, screenshots</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/history" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">View History</p>
                      <p className="text-xs text-muted-foreground">Previous analyses and results</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/jira" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Jira Tickets</p>
                      <p className="text-xs text-muted-foreground">Manage created tickets</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/settings" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">Settings</p>
                      <p className="text-xs text-muted-foreground">Configure Jira integration</p>
                    </div>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Analyses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Analyses</h2>
            <Link href="/history" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentAnalyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="group"
              >
                <Link href={`/analyze/${analysis.id}`} className="block">
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-semibold text-lg">{analysis.title}</h3>
                            <Badge variant="outline" className={priorityColors[analysis.priority]}>
                              {analysis.priority}
                            </Badge>
                            <Badge variant="secondary">
                              <Brain className="h-3 w-3 mr-1" />
                              {analysis.confidence}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 font-mono">{analysis.file}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                          <span>{formatDistanceToNow(analysis.time, { addSuffix: true })}</span>
                          <Badge variant={analysis.status === "completed" ? "success" : "outline"}>
                            {analysis.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}