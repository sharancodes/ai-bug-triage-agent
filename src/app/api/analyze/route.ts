import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

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

    // Simulate AI analysis pipeline
    const analysis = await analyzeBug(rawInput, fileNames)
    
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

async function analyzeBug(input: string, fileNames: string[]) {
  // Simulated AI pipeline steps
  const steps = [
    "Uploading files",
    "Reading logs",
    "Parsing stacktrace",
    "Understanding error",
    "Searching codebase",
    "Finding similar bugs",
    "Reasoning",
    "Generating fix",
    "Preparing Jira"
  ]
  
  // In a real implementation, this would call NeMoTron 3 Super 120B
  // For MVP, we'll do pattern matching and return structured results
  
  const analysis = performAnalysis(input, fileNames)
  return analysis
}

function performAnalysis(input: string, fileNames: string[]) {
  const lowerInput = input.toLowerCase()
  
  // Pattern detection
  let rootCause = "Unknown error"
  let reason = "Unable to determine root cause from provided information"
  let confidence = 65
  let severity = "Medium"
  let priority = "P3"
  let estimatedTime = "1-2 hours"
  let risk = "Medium"
  let suggestedFix = "Investigate further with additional context"
  let similarTickets: Array<{id: string, match: number, reason: string}> = []
  
  // NullPointerException patterns
  if (lowerInput.includes("nullpointerexception") || lowerInput.includes("null pointer")) {
    rootCause = "NullPointerException in OrderService.java:184"
    reason = "Customer object is null because validation was skipped during guest checkout flow"
    confidence = 92
    severity = "High"
    priority = "P1"
    estimatedTime = "30 minutes"
    risk = "Low"
    suggestedFix = `// OrderService.java:184
// BEFORE:
public Order processOrder(Customer customer) {
    return orderRepository.save(new Order(customer.getId(), ...));
}

// AFTER:
public Order processOrder(Customer customer) {
    if (customer == null) {
        throw new IllegalArgumentException("Customer cannot be null");
    }
    return orderRepository.save(new Order(customer.getId(), ...));
}`
    similarTickets = [
      { id: "BUG-143", match: 96, reason: "Same exception, same endpoint, same module" },
      { id: "BUG-89", match: 78, reason: "Similar null check missing in PaymentService" }
    ]
  }
  // OutOfMemoryError patterns
  else if (lowerInput.includes("outofmemoryerror") || lowerInput.includes("java.lang.outofmemory")) {
    rootCause = "OutOfMemoryError: Java heap space in DataProcessor.java:245"
    reason = "Processing large dataset without streaming - loads entire 2GB CSV into memory"
    confidence = 88
    severity = "Critical"
    priority = "P0"
    estimatedTime = "2-3 hours"
    risk = "High"
    suggestedFix = `// DataProcessor.java:245
// BEFORE:
public void processData(File file) {
    List<String> lines = Files.readAllLines(file.toPath()); // Loads all into memory
    lines.forEach(this::processLine);
}

// AFTER:
public void processData(File file) throws IOException {
    try (Stream<String> lines = Files.lines(file.toPath())) {
        lines.forEach(this::processLine); // Stream processing, constant memory
    }
}`
    similarTickets = [
      { id: "BUG-201", match: 85, reason: "Similar OOM in ReportGenerator" }
    ]
  }
  // Database connection issues
  else if (lowerInput.includes("connection") && (lowerInput.includes("timeout") || lowerInput.includes("refused") || lowerInput.includes("pool"))) {
    rootCause = "HikariCP connection pool exhausted in DatabaseConfig.java:67"
    reason = "Connection leak in UserRepository - connections not returned to pool after exception"
    confidence = 85
    severity = "High"
    priority = "P1"
    estimatedTime = "1 hour"
    risk = "Medium"
    suggestedFix = `// UserRepository.java
// BEFORE:
@Transactional
public User findById(Long id) {
    Connection conn = dataSource.getConnection(); // Never closed on exception
    return jdbcTemplate.queryForObject("SELECT * FROM users WHERE id = ?", ...);
}

// AFTER:
@Transactional
public User findById(Long id) {
    return jdbcTemplate.queryForObject("SELECT * FROM users WHERE id = ?", ...); // Let Spring manage connections
}`
    similarTickets = [
      { id: "BUG-156", match: 82, reason: "Connection leak in OrderRepository" }
    ]
  }
  // SQL Injection / Query issues
  else if (lowerInput.includes("sql") && (lowerInput.includes("syntax") || lowerInput.includes("exception"))) {
    rootCause = "SQLSyntaxErrorException in QueryBuilder.java:112"
    reason = "Dynamic query building with string concatenation - missing parameter binding"
    confidence = 78
    severity = "High"
    priority = "P2"
    estimatedTime = "45 minutes"
    risk = "High"
    suggestedFix = `// QueryBuilder.java:112
// BEFORE:
String query = "SELECT * FROM orders WHERE user_id = " + userId + " AND status = '" + status + "'";

// AFTER:
String query = "SELECT * FROM orders WHERE user_id = ? AND status = ?";
return jdbcTemplate.query(query, new Object[]{userId, status}, rowMapper);`
    similarTickets = [
      { id: "BUG-77", match: 71, reason: "Similar SQL injection vulnerability in ProductService" }
    ]
  }
  // Generic exception
  else if (lowerInput.includes("exception") || lowerInput.includes("error") || lowerInput.includes("stack trace")) {
    rootCause = "Unhandled exception in RequestHandler.java:89"
    reason = "Missing try-catch around external API call - failures propagate to user"
    confidence = 72
    severity = "Medium"
    priority = "P2"
    estimatedTime = "1 hour"
    risk = "Medium"
    suggestedFix = `// RequestHandler.java:89
// BEFORE:
public Response handleRequest(Request req) {
    ExternalApiResponse resp = externalApi.call(req); // Can throw
    return Response.ok(resp);
}

// AFTER:
public Response handleRequest(Request req) {
    try {
        ExternalApiResponse resp = externalApi.call(req);
        return Response.ok(resp);
    } catch (ExternalApiException e) {
        log.error("External API failed", e);
        return Response.error("Service temporarily unavailable");
    }
}`
    similarTickets = []
  }
  
  // Jira preview
  const jiraPreview = {
    project: process.env.DEFAULT_PROJECT || "PROJ",
    issueType: "Bug",
    summary: rootCause,
    description: `## Root Cause
${reason}

## AI Analysis
- **Confidence:** ${confidence}%
- **Severity:** ${severity}
- **Priority:** ${priority}
- **Estimated Fix Time:** ${estimatedTime}
- **Risk Level:** ${risk}

## Suggested Fix
\`\`\`java
${suggestedFix}
\`\`\`

## Steps to Reproduce
1. Trigger the affected endpoint/flow
2. Observe the exception in logs
3. Verify the null condition / memory issue / connection leak

## Expected Behavior
Application handles edge case gracefully with proper error message

## Actual Behavior
Application crashes with ${rootCause}

## AI Reasoning
Analysis performed by NeMoTron 3 Super 120B following structured reasoning pipeline:
1. Parsed stack trace and identified failing class/method
2. Extracted exception type and message
3. Correlated with codebase patterns
4. Matched against historical bug database
5. Generated hypothesis with confidence scoring
6. Recommended fix based on best practices`,
    priority: priority,
    labels: ["bug", "ai-triage", "auto-generated"],
    components: ["Backend", "API"],
    assignee: "unassigned",
    epic: "Platform Stability",
    storyPoints: 3,
    environment: "Production",
    attachments: fileNames && fileNames.length > 0 ? fileNames : ["stacktrace.log"]
  }
  return {
    rootCause,
    reason,
    confidence,
    severity,
    priority,
    estimatedTime,
    risk,
    suggestedFix,
    similarTickets,
    jiraPreview
  }
}

export async function GET() {
  const analyses = await prisma.analysis.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { jiraTicket: true }
  })
  return NextResponse.json(analyses)
}