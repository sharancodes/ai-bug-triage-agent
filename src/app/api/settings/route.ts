import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } })
    if (!settings) {
      return NextResponse.json({})
    }
    // Don't return the API token in plain text for security
    const { jiraApiToken, ...safeSettings } = settings
    return NextResponse.json(safeSettings)
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: body,
      create: { id: 1, ...body }
    })
    const { jiraApiToken, ...safeSettings } = settings
    return NextResponse.json(safeSettings)
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}