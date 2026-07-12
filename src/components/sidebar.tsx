"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  LayoutDashboard, 
  Search, 
  History, 
  Ticket, 
  Settings, 
  Brain,
  ChevronLeft,
  ChevronRight,
  Bug,
  Zap
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Analyze Bug", href: "/analyze", icon: Brain },
  { name: "History", href: "/history", icon: History },
  { name: "Jira Tickets", href: "/jira", icon: Ticket },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-200 flex flex-col",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bug className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">BugTriage AI</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Stats Summary */}
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-t"
          >
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Quick Stats
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card variant="outline" className="p-3">
                <div className="text-2xl font-bold text-primary">124</div>
                <div className="text-xs text-muted-foreground">Analyzed</div>
              </Card>
              <Card variant="outline" className="p-3">
                <div className="text-2xl font-bold text-green-500">92%</div>
                <div className="text-xs text-muted-foreground">Avg Confidence</div>
              </Card>
              <Card variant="outline" className="p-3">
                <div className="text-2xl font-bold text-destructive">18</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </Card>
              <Card variant="outline" className="p-3">
                <div className="text-2xl font-bold text-blue-500">89</div>
                <div className="text-xs text-muted-foreground">Tickets</div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="p-4 border-t">
        {!collapsed && (
          <div className="text-xs text-muted-foreground text-center">
            Powered by NeMoTron 3 Super 120B
          </div>
        )}
      </div>
    </motion.aside>
  )
}