import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const JIRA_BASE_URL = "https://sharanhitam.atlassian.net"

async function createJiraTicket(fields: {
  project: string
  issueType: string
  summary: string
  description: string
  priority: string
  labels?: string[]
  components?: string[]
  assignee?: string
  epic?: string
  storyPoints?: number
  environment?: string
}, jiraEmail: string, jiraApiToken: string) {
  const url = `${JIRA_BASE_URL}/rest/api/3/issue`

  const priorityMap: Record<string, string> = {
    "P0": "Highest",
    "P1": "High",
    "P2": "Medium",
    "P3": "Low",
  }

  const issuePayload: Record<string, unknown> = {
    fields: {
      project: {
        key: fields.project,
      },
      summary: fields.summary,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: fields.description
              ? [{ type: "text", text: fields.description }]
              : [],
          },
        ],
      },
      issuetype: {
        name: fields.issueType || "Bug",
      },
      priority: {
        name: priorityMap[fields.priority] || "Medium",
      },
      labels: fields.labels || [],
    },
  }

  if (fields.components?.length) {
    ;(issuePayload.fields as Record<string, unknown>).components = fields.components.map((c) => ({ name: c }))
  }

  if (fields.environment) {
    ;(issuePayload.fields as Record<string, unknown>).environment = {
      type: "doc",
      version: 1,
      content: [{ type: "paragraph", content: [{ type: "text", text: fields.environment }] }],
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString("base64")}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(issuePayload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Jira API error ${response.status}: ${error}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      analysisId,
      project,
      issueType,
      summary,
      description,
      priority,
      labels,
      components,
      assignee,
      epic,
      storyPoints,
      environment,
    } = body

    if (!analysisId || !project || !summary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } })
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    const settings = await prisma.settings.findUnique({ where: { id: 1 } })

    let ticketKey: string
    let jiraUrl: string

    if (settings?.jiraEmail && settings?.jiraApiToken && settings?.jiraUrl) {
      // Real Jira API call
      try {
        const result = await createJiraTicket(
          {
            project,
            issueType: issueType || "Bug",
            summary,
            description,
            priority: priority || "P3",
            labels,
            components,
            epic,
            storyPoints,
            environment,
          },
          settings.jiraEmail,
          settings.jiraApiToken
        )
        ticketKey = result.key
        jiraUrl = `${JIRA_BASE_URL}/browse/${ticketKey}`
      } catch (jiraError) {
        console.error("Jira API error:", jiraError)
        return NextResponse.json(
          { error: `Failed to create Jira ticket: ${(jiraError as Error).message}` },
          { status: 502 }
        )
      }
    } else {
      // Fallback: create local record only (no real Jira)
      ticketKey = `${project}-${Date.now().toString(36).toUpperCase()}`
      jiraUrl = `${JIRA_BASE_URL}/browse/${ticketKey}`
    }

    const ticket = await prisma.jiraTicket.create({
      data: {
        key: ticketKey,
        analysisId,
        project,
        issueType: issueType || "Bug",
        summary,
        description,
        priority: priority || "Medium",
        labels: JSON.stringify(labels || []),
        components: JSON.stringify(components || []),
        assignee,
        epic,
        storyPoints: storyPoints ? parseInt(storyPoints.toString()) : null,
        environment,
        attachments: "[]",
        status: "Created",
      },
    })

    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        jiraPreview: JSON.stringify({ ...JSON.parse(analysis.jiraPreview || "{}"), ticketKey, jiraUrl }),
      },
    })

    return NextResponse.json({
      success: true,
      ticketKey,
      url: jiraUrl,
      ticket,
    })
  } catch (error) {
    console.error("Jira creation error:", error)
    return NextResponse.json({ error: "Failed to create Jira ticket" }, { status: 500 })
  }
}

export async function GET() {
  const tickets = await prisma.jiraTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { analysis: true },
  })
  return NextResponse.json(tickets)
}
