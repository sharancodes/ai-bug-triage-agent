import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const analyses = await prisma.analysis.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    })
    return NextResponse.json(analyses)
  } catch (error) {
    console.error("History fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}