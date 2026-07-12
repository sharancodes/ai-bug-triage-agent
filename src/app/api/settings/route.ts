import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } })
    if (!settings) {
      return NextResponse.json({})
    }
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

// Test Jira connection server-side (avoids CORS)
export async function POST(request: NextRequest) {
  try {
    const { jiraUrl, jiraEmail, jiraApiToken } = await request.json()

    if (!jiraUrl || !jiraEmail || !jiraApiToken) {
      return NextResponse.json(
        { success: false, message: "Missing Jira URL, email, or API token" },
        { status: 400 }
      )
    }

    const credentials = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString("base64")
    const res = await fetch(`${jiraUrl}/rest/api/3/myself`, {
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Accept": "application/json",
      },
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json(
        { success: false, message: `Jira rejected the credentials (${res.status}): ${err}` },
        { status: 401 }
      )
    }

    const me = await res.json()
    return NextResponse.json({
      success: true,
      message: `Connected as ${me.displayName} (${me.emailAddress})`,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Connection failed: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}