import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Use settings from DB, fallback to env vars or hardcoded default
const DEFAULT_JIRA_URL = "https://sharanhitam.atlassian.net"

function priorityToJiraName(priority: string): string {
  const map: Record<string, string> = {
    P0: "Highest",
    P1: "High",
    P2: "Medium",
    P3: "Low",
    Critical: "Highest",
    High: "High",
    Medium: "Medium",
    Low: "Low",
  }
  return map[priority] ?? "Medium"
}

function buildDescription(description: string): object {
  // Wrap plain text in Jira ADF (Atlassian Document Format)
  if (!description) {
    return {
      type: "doc",
      version: 1,
      content: [{ type: "paragraph", content: [] }],
    }
  }
  return {
    type: "doc",
    version: 1,
    content: description.split("\n").map((line) => ({
      type: "paragraph",
      content: [{ type: "text", text: line }],
    })),
  }
}

async function createJiraTicketViaRestApi(fields: {
  projectKey: string
  issueType: string
  summary: string
  description: string
  priority: string
  labels?: string[]
  components?: string[]
  epicName?: string
  storyPoints?: number
  environment?: string
}, jiraEmail: string, jiraApiToken: string, jiraBaseUrl: string) {
  const issuePayload: Record<string, unknown> = {
    fields: {
      project: { key: fields.projectKey },
      summary: fields.summary,
      description: buildDescription(fields.description),
      issuetype: { name: fields.issueType || "Bug" },
      priority: { name: priorityToJiraName(fields.priority) },
      labels: fields.labels || [],
    },
  }

  if (fields.components?.length) {
    issuePayload.fields = {
      ...issuePayload.fields,
      components: fields.components.map((c) => ({ name: c })),
    }
  }

  if (fields.environment) {
    issuePayload.fields = {
      ...issuePayload.fields,
      environment: buildDescription(fields.environment),
    }
  }

  // Add Epic link if provided (Jira Software)
  if (fields.epicName) {
    // We'll create the epic first, then link it — or just set the Epic Link custom field
    // For simplicity: set Epic Link custom field by name
    ;(issuePayload.fields as Record<string, unknown>).customfield_10011 = fields.epicName
  }

  // Add Story Points (customfield_10016 is common for Story Points in Jira Software)
  if (typeof fields.storyPoints === "number") {
    ;(issuePayload.fields as Record<string, unknown>).customfield_10016 = fields.storyPoints
  }

  const response = await fetch(`${jiraBaseUrl}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString("base64")}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(issuePayload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Jira API error ${response.status}: ${errorText}`)
  }

  return response.json()
}

async function getOrCreateEpic(jiraEmail: string, jiraApiToken: string, jiraBaseUrl: string, epicName: string) {
  // Search for existing epic by name
  const searchRes = await fetch(
    `${jiraBaseUrl}/rest/api/3/search?jql=${encodeURIComponent(`project IS NOT EMPTY AND issuetype = Epic AND summary ~ "${epicName}" MAXResults 1`)}`,
    {
      headers: {
        "Authorization": `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString("base64")}`,
        "Accept": "application/json",
      },
    }
  )

  if (searchRes.ok) {
    const data = await searchRes.json()
    if (data.issues?.length > 0) {
      return data.issues[0].key
    }
  }

  // Create new epic
  const epicRes = await fetch(`${jiraBaseUrl}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString("base64")}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      fields: {
        project: { key: "PROJ" }, // default project for epic creation
        summary: epicName,
        issuetype: { name: "Epic" },
      },
    }),
  })

  if (!epicRes.ok) {
    const err = await epicRes.text()
    throw new Error(`Failed to create Epic: ${err}`)
  }

  const epic = await epicRes.json()
  return epic.key
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

    if (!project || !summary) {
      return NextResponse.json({ error: "Missing required fields: project, summary" }, { status: 400 })
    }

    // Fetch settings from DB
    const settings = await prisma.settings.findUnique({ where: { id: 1 } })

    const jiraBaseUrl = settings?.jiraUrl || DEFAULT_JIRA_URL
    const jiraEmail = settings?.jiraEmail || process.env.JIRA_EMAIL
    const jiraApiToken = settings?.jiraApiToken || process.env.JIRA_API_TOKEN
    const defaultProject = settings?.defaultProject || project

    let ticketKey: string
    let jiraUrl: string
    let createdViaApi = false

    // Resolve Epic key if epic name is provided
    let epicKey: string | undefined
    if (epic) {
      try {
        epicKey = await getOrCreateEpic(
          jiraEmail as string,
          jiraApiToken as string,
          jiraBaseUrl,
          epic
        )
      } catch (epicError) {
        console.warn("Epic resolution failed, skipping epic link:", epicError)
      }
    }

    if (jiraEmail && jiraApiToken) {
      // Real Jira API call
      try {
        const result = await createJiraTicketViaRestApi(
          {
            projectKey: defaultProject,
            issueType: issueType || "Bug",
            summary,
            description: description || "",
            priority: priority || "P2",
            labels: labels || ["bug", "ai-triage"],
            components,
            epicName: epic,
            storyPoints: typeof storyPoints === "number" ? storyPoints : undefined,
            environment,
          },
          jiraEmail,
          jiraApiToken,
          jiraBaseUrl
        )
        ticketKey = result.key
        jiraUrl = `${jiraBaseUrl}/browse/${ticketKey}`
        createdViaApi = true

        // Link epic if resolved
        if (epicKey && ticketKey) {
          await fetch(`${jiraBaseUrl}/rest/api/3/issue/${ticketKey}`, {
            method: "PUT",
            headers: {
              "Authorization": `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString("base64")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                customfield_10011: epicKey, // Epic Link
              },
            }),
          }).catch((e) => console.warn("Failed to link epic:", e))
        }
      } catch (jiraError) {
        console.error("Jira API error:", jiraError)
        return NextResponse.json(
          { error: `Failed to create Jira ticket: ${(jiraError as Error).message}` },
          { status: 502 }
        )
      }
    } else {
      // No credentials — create local record with mock key
      ticketKey = `${defaultProject}-${Date.now().toString(36).toUpperCase()}`
      jiraUrl = `${jiraBaseUrl}/browse/${ticketKey}`
    }

    // Save to local DB
    const ticket = await prisma.jiraTicket.create({
      data: {
        key: ticketKey,
        analysisId: analysisId || null,
        project: defaultProject,
        issueType: issueType || "Bug",
        summary,
        description: description || "",
        priority: priority || "Medium",
        labels: JSON.stringify(labels || []),
        components: JSON.stringify(components || []),
        assignee: assignee || null,
        epic: epicKey || epic || null,
        storyPoints: typeof storyPoints === "number" ? storyPoints : null,
        environment: environment || null,
        attachments: "[]",
        status: createdViaApi ? "Created" : "Local Only",
      },
    })

    // Update analysis with ticket info
    if (analysisId) {
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          jiraPreview: JSON.stringify({ ticketKey, jiraUrl, createdViaApi }),
        },
      }).catch(() => {/* analysis might not exist */})
    }

    return NextResponse.json({
      success: true,
      ticketKey,
      url: jiraUrl,
      createdViaApi,
      ticketId: ticket.id,
    })
  } catch (error) {
    console.error("Jira creation error:", error)
    return NextResponse.json(
      { error: `Internal error: ${(error as Error).message}` },
      { status: 500 }
    )
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
