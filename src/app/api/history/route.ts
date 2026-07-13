import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    if (!prisma) return NextResponse.json([])
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
