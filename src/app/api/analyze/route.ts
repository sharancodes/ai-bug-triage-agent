import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // OpenRouter API key: read from env vars (available on Vercel serverless)
    const openRouterApiKey = process.env.OPENROUTER_API_KEY
    const openRouterModel = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b"

    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured. Set it in Vercel project settings → Environment Variables." },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const text = formData.get("text") as string

    let fileContents = ""
    const fileNames: string[] = []

    for (const file of files) {
      fileNames.push(file.name)
      if (file.type.startsWith("text/") || file.name.endsWith(".log") || file.name.endsWith(".txt")) {
        const content = await file.text()
        fileContents += `\n\n--- FILE: ${file.name} ---\n${content}`
      }
    }

    const rawInput = text + fileContents

    if (!rawInput.trim()) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 })
    }

    const analysis = await analyzeBugWithAI(rawInput, fileNames, openRouterApiKey, openRouterModel)

    const saved = await prisma.analysis.create({
      data: {
        rootCause: analysis.rootCause,
        reason: analysis.reason,
        confidence: analysis.confidence,
        severity: analysis.severity,
        priority: analysis.priority,
        estimatedTime: analysis.estimatedTime,
        risk: analysis.risk,
        suggestedFix: analysis.suggestedFix,
        similarTickets: JSON.stringify(analysis.similarTickets),
        jiraPreview: JSON.stringify(analysis.jiraPreview),
      },
    })

    return NextResponse.json({ ...analysis, id: saved.id })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: (error as Error).message || "Analysis failed" }, { status: 500 })
  }
}

async function analyzeBugWithAI(input: string, fileNames: string[], openRouterApiKey: string, openRouterModel: string) {
  const systemPrompt = `You are an expert software bug triage AI. Analyze bug reports, stack traces, and error logs.

Return a JSON object with this exact structure:
{
  "rootCause": "concise description of the root cause",
  "reason": "detailed explanation of why this bug occurs",
  "confidence": 0-100,
  "severity": "Critical | High | Medium | Low",
  "priority": "P0 | P1 | P2 | P3",
  "estimatedTime": "e.g. 30 minutes, 2-3 hours",
  "risk": "High | Medium | Low",
  "suggestedFix": "code snippet showing before/after fix",
  "similarTickets": [{"id": "BUG-123", "match": 85, "reason": "similar cause"}],
  "jiraPreview": {
    "summary": "Jira ticket summary line",
    "description": "Full Jira ticket description with markdown",
    "labels": ["bug", "backend"],
    "components": ["Backend"],
    "epic": "Epic name or empty string"
  }
}

Rules:
- confidence below 60 means low certainty — say what's missing
- Do not fabricate file names, line numbers, or ticket IDs not in the input
- severity: Critical=outage, High=data loss/security, Medium=broken feature, Low=cosmetic
- priority: P0=Critical, P1=High, P2=Medium, P3=Low
- suggestedFix must be actual code, not a description`

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "AI Bug Triage Agent",
    },
    body: JSON.stringify({
      model: openRouterModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this bug/error:\n\n${input}${fileNames.length > 0 ? `\n\nUploaded files: ${fileNames.join(", ")}` : ""}` }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || "{}"

  // Strip markdown code blocks if present
  let jsonStr = text
  const firstBrace = text.indexOf("{")
  const lastBrace = text.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = text.substring(firstBrace, lastBrace + 1)
  }

  let result: Record<string, unknown>
  try {
    result = JSON.parse(jsonStr)
  } catch {
    throw new Error(`Failed to parse AI response as JSON. Raw response: ${text.substring(0, 200)}`)
  }

  if (!result.rootCause || !result.severity || !result.priority) {
    throw new Error(`AI response missing required fields: rootCause=${result.rootCause}, severity=${result.severity}, priority=${result.priority}`)
  }

  // Fill defaults
  if (!result.confidence) result.confidence = 50
  if (!result.severity) result.severity = "Medium"
  if (!result.priority) result.priority = "P2"
  if (!result.estimatedTime) result.estimatedTime = "1-2 hours"
  if (!result.risk) result.risk = "Medium"
  if (!result.suggestedFix) result.suggestedFix = "// Review and implement appropriate fix"
  if (!result.similarTickets) result.similarTickets = []
  if (!result.jiraPreview) {
    result.jiraPreview = {
      summary: result.rootCause,
      description: result.reason,
      labels: ["bug", "ai-triage"],
      components: ["Backend"],
      epic: "Bug Fixes",
    }
  }

  if (result.jiraPreview) {
    ;(result.jiraPreview as Record<string, unknown>).attachments = fileNames.length > 0 ? fileNames : ["stacktrace.log"]
  }

  return result
}

export async function GET() {
  const analyses = await prisma.analysis.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { jiraTicket: true },
  })
  return NextResponse.json(analyses)
}
