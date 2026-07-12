import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const text = formData.get("text") as string

    // Parse uploaded files
    let fileContents = ""
    const fileNames: string[] = []

    for (const file of files) {
      fileNames.push(file.name)
      if (file.type.startsWith("text/") || file.name.endsWith(".log") || file.name.endsWith(".txt")) {
        const text = await file.text()
        fileContents += `\n\n--- FILE: ${file.name} ---\n${text}`
      }
    }

    const rawInput = text + fileContents

    if (!rawInput.trim()) {
      return NextResponse.json({ error: "No input provided" }, { status: 400 })
    }

    // Real AI analysis via OpenRouter
    const analysis = await analyzeBugWithAI(rawInput, fileNames)

    // Save to database
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
      }
    })

    return NextResponse.json({ ...analysis, id: saved.id })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}

async function analyzeBugWithAI(input: string, fileNames: string[]) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured")
  }

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
    "summary": "root cause summary for Jira",
    "description": "detailed Jira description in markdown",
    "labels": ["bug", "ai-triage"],
    "components": ["Backend"],
    "epic": "Bug Fixes"
  }
}

Rules:
- confidence should reflect how certain you are based on available evidence
- severity: Critical=outage, High=data loss/security, Medium=broken feature, Low=cosmetic
- priority: P0=Critical, P1=High, P2=Medium, P3=Low
- suggestedFix must be actual code, not a description
- If input is unclear/insufficient, set confidence below 60 and say what's missing
- Do not fabricate file names or line numbers not present in the input`

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "AI Bug Triage Agent",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
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
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error("No response from OpenRouter")
  }

  // Extract JSON from response (model might wrap it in markdown code blocks)
  let jsonStr = content.trim()
  const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1]
  } else {
    // Try to find JSON object in the string
    const start = jsonStr.indexOf("{")
    const end = jsonStr.lastIndexOf("}")
    if (start !== -1 && end !== -1) {
      jsonStr = jsonStr.substring(start, end + 1)
    }
  }

  let result = JSON.parse(jsonStr)

  // Fallback values for safety
  if (!result.rootCause) result.rootCause = "Analysis completed"
  if (!result.confidence) result.confidence = 75
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

  // Inject file names into Jira attachments
  if (result.jiraPreview) {
    result.jiraPreview.attachments = fileNames.length > 0 ? fileNames : ["stacktrace.log"]
  }

  return result
}

export async function GET() {
  const analyses = await prisma.analysis.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { jiraTicket: true }
  })
  return NextResponse.json(analyses)
}
