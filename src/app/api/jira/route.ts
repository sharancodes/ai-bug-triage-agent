import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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
      attachments 
    } = body

    // Validate required fields
    if (!analysisId || !project || !summary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the analysis
    const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } })
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    // Get settings for Jira credentials
    const settings = await prisma.settings.findUnique({ where: { id: 1 } })
    
    // In production, this would call the actual Jira REST API
    // For MVP, we simulate the ticket creation
    const ticketKey = generateTicketKey(project)
    
    // Create ticket record
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
        attachments: JSON.stringify(attachments || []),
        status: "Created",
      }
    })

    // Update analysis with ticket reference
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { jiraPreview: JSON.stringify({ ...JSON.parse(analysis.jiraPreview || "{}"), ticketKey }) }
    })

    return NextResponse.json({ 
      success: true, 
      ticketKey,
      url: `${settings?.jiraUrl || "https://your-company.atlassian.net"}/browse/${ticketKey}`,
      ticket
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
    include: { analysis: true }
  })
  return NextResponse.json(tickets)
}

function generateTicketKey(project: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${project}-${timestamp}${random}`
}