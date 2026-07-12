"use client"

import * as React from "react"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Toaster />
      {children}
    </div>
  )
}