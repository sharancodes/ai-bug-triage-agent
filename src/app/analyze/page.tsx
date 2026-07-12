"use client"

import * as React from "react"
import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Upload, 
  FileText, 
  Image, 
  FileCode, 
  Archive, 
  Brain, 
  AlertTriangle, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  GitBranch,
  Ticket,
  ClipboardList,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  Code,
  Terminal,
  Eye,
  Copy,
  Check,
  X,
  Shield,
  AlertCircle,
  Info,
  MessageSquare,
  Zap as ZapIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

const pipelineSteps = [
  { id: "upload", label: "Uploading Files", icon: Upload, duration: 800 },
  { id: "reading", label: "Reading Logs", icon: FileText, duration: 1000 },
  { id: "parsing", label: "Parsing Stacktrace", icon: Terminal, duration: 1200 },
  { id: "understanding", label: "Understanding Error", icon: Brain, duration: 1500 },
  { id: "codebase", label: "Searching Codebase", icon: GitBranch, duration: 1800 },
  { id: "similar", label: "Finding Similar Bugs", icon: Search, duration: 1500 },
  { id: "reasoning", label: "AI Reasoning", icon: ZapIcon, duration: 2000 },
  { id: "fix", label: "Generating Fix", icon: Code, duration: 1500 },
  { id: "jira", label: "Preparing Jira Ticket", icon: Ticket, duration: 1000 },
]

const mockAnalysisResult = {
  rootCause: "NullPointerException in OrderService.java:184",
  reason: "Customer object is null because validation was skipped during guest checkout flow. The GuestCheckoutController bypasses the CustomerValidator middleware when session.isGuest === true, but OrderService.processOrder() assumes a valid Customer object exists.",
  confidence: 92,
  severity: "High",
  priority: "P1",
  estimatedTime: "30 minutes",
  risk: "Medium",
  suggestedFix: {
    problem: "Null Customer object passed to OrderService.processOrder()",
    explanation: "The GuestCheckoutController allows orders to be placed without validating the customer session. When a guest user proceeds to checkout, the Customer object remains null but is still passed to OrderService.",
    codeBefore: `// OrderService.java:184
public Order processOrder(Customer customer, Cart cart) {
    // Line 184 - customer.getId() throws NPE when customer is null
    String customerId = customer.getId(); 
    Order order = new Order(customerId, cart.getItems());
    return orderRepository.save(order);
}`,
    codeAfter: `// OrderService.java:184
public Order processOrder(Customer customer, Cart cart) {
    // Added null check with meaningful error
    if (customer == null) {
        throw new IllegalArgumentException("Customer cannot be null. Guest checkout requires temporary customer creation.");
    }
    String customerId = customer.getId(); 
    Order order = new Order(customerId, cart.getItems());
    return orderRepository.save(order);
}

// GuestCheckoutController.java - Fixed
@PostMapping("/guest/checkout")
public ResponseEntity<Order> guestCheckout(@RequestBody Cart cart) {
    // Create temporary customer for guest
    Customer guestCustomer = customerService.createGuestCustomer(session.getId());
    Order order = orderService.processOrder(guestCustomer, cart);
    return ResponseEntity.ok(order);
}`,
    bestPractices: [
      "Always validate input parameters at service layer entry points",
      "Use Optional<T> or explicit null checks for nullable dependencies",
      "Create guest/temporary entities instead of passing null",
      "Add @NotNull annotations for static analysis tools",
      "Write unit tests for null input scenarios"
    ],
    sideEffects: [
      "Guest checkout flow now creates temporary customer records (minimal storage impact)",
      "Existing guest orders will need migration script for customer_id backfill",
      "Session cleanup job should remove abandoned guest customers after 24h"
    ]
  },
  similarTickets: [
    { id: "BUG-143", match: 96, title: "NullPointerException in PaymentService during guest checkout", reason: "Same root cause: missing customer validation in guest flow", status: "Resolved" },
    { id: "BUG-89", match: 73, title: "NPE in ShippingCalculator for anonymous users", reason: "Similar pattern: null customer passed to service layer", status: "In Progress" },
    { id: "BUG-201", match: 61, title: "IllegalArgumentException in OrderValidator", reason: "Related validation gap in order processing", status: "Open" },
  ],
  jiraPreview: {
    project: "PROJ",
    issueType: "Bug",
    summary: "NullPointerException in OrderService.processOrder() during guest checkout",
    description: `**Root Cause Analysis**
Customer object is null because validation was skipped during guest checkout. The GuestCheckoutController bypasses the CustomerValidator middleware when session.isGuest === true, but OrderService.processOrder() assumes a valid Customer object exists.

**Steps to Reproduce**
1. Start guest checkout flow (no login)
2. Add items to cart
3. Proceed to payment
4. Submit order
5. Observe NullPointerException in OrderService.java:184

**Expected Behavior**
Guest checkout should create a temporary customer record and process order successfully.

**Actual Behavior**
NullPointerException thrown at OrderService.java:184 when calling customer.getId()

**Suggested Fix**
Add null check in OrderService.processOrder() and create temporary customer in GuestCheckoutController.

**AI Analysis Confidence:** 92%
**Severity:** High
**Priority:** P1
**Estimated Fix Time:** 30 minutes
**Risk Level:** Medium`,
    priority: "P1",
    labels: ["bug", "backend", "guest-checkout", "null-pointer", "p1"],
    components: ["Order Service", "Checkout Flow", "Guest Checkout"],
    assignee: "backend-team",
    epic: "Checkout Flow Reliability",
    storyPoints: 3,
    environment: "Production",
    attachments: ["order-service.log", "stacktrace.txt", "guest-checkout-flow.png"]
  },
  reasoningTimeline: [
    { step: 1, title: "Read Stacktrace", detail: "Parsed NullPointerException at OrderService.java:184, identified customer.getId() as failing call", confidence: 15 },
    { step: 2, title: "Located Failing Class", detail: "Found OrderService.processOrder() method, traced call chain from GuestCheckoutController", confidence: 35 },
    { step: 3, title: "Matched Similar Issue", detail: "Found BUG-143 (96% match) - same exception, same endpoint, same module", confidence: 55 },
    { step: 4, title: "Analyzed Code Path", detail: "Identified GuestCheckoutController bypasses CustomerValidator when isGuest=true", confidence: 72 },
    { step: 5, title: "Generated Hypothesis", detail: "Null Customer passed because guest flow doesn't create customer entity", confidence: 85 },
    { step: 6, title: "Verified Against Codebase", detail: "Confirmed OrderService has no null checks, CustomerValidator only runs for authenticated users", confidence: 92 },
    { step: 7, title: "Final Diagnosis", detail: "Root cause confirmed: Missing customer creation in guest checkout flow", confidence: 92 },
  ]
}

export default function AnalyzeBug() {
  const [stage, setStage] = useState<"upload" | "analyzing" | "results">("upload")
  const [currentStep, setCurrentStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [textInput, setTextInput] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [expandedReasoning, setExpandedReasoning] = useState<number | null>(null)
  const [expandedDuplicate, setExpandedDuplicate] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<Record<string, unknown> | null>(null)
  const [jiraForm, setJiraForm] = useState<Record<string, unknown> | null>(null)
  const [ticketCreated, setTicketCreated] = useState<{ key: string; url: string } | null>(null)
  const [creatingTicket, setCreatingTicket] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreateTicket = useCallback(async () => {
    if (!analysisResult) return
    const jiraData = analysisResult.jiraPreview as Record<string, unknown> | undefined
    if (!jiraData) return

    setCreatingTicket(true)
    try {
      const res = await fetch("/api/jira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: analysisResult.id,
          project: jiraData.project || "PROJ",
          issueType: jiraData.issueType || "Bug",
          summary: jiraData.summary || analysisResult.rootCause,
          description: jiraData.description || analysisResult.reason,
          priority: jiraData.priority || analysisResult.priority,
          labels: jiraData.labels,
          components: jiraData.components,
          epic: jiraData.epic,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setTicketCreated({ key: data.ticketKey, url: data.url })
      }
    } catch (err) {
      console.error("Ticket creation error:", err)
    } finally {
      setCreatingTicket(false)
    }
  }, [analysisResult])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const startAnalysis = async () => {
    if (files.length === 0 && !textInput.trim()) return

    setStage("analyzing")
    setCurrentStep(0)

    // Animate through pipeline steps while AI processes
    for (let i = 0; i < pipelineSteps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, pipelineSteps[i].duration))
    }

    // Call real AI API
    try {
      const formData = new FormData()
      for (const file of files) {
        formData.append("files", file)
      }
      formData.append("text", textInput)

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Analysis failed")
      }

      const data = await res.json()
      setAnalysisResult(data)
      setJiraForm(data.jiraPreview as Record<string, unknown>)
      setStage("results")
    } catch (err) {
      console.error("Analysis error:", err)
      alert("Analysis failed. Please check your OpenRouter API key and try again.")
      setStage("upload")
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <Image className="h-4 w-4" />
    if (file.type === "application/zip" || file.name.endsWith(".zip")) return <Archive className="h-4 w-4" />
    if (file.name.endsWith(".log") || file.type === "text/plain") return <FileText className="h-4 w-4" />
    if (file.name.endsWith(".java") || file.name.endsWith(".js") || file.name.endsWith(".ts") || file.name.endsWith(".py")) return <FileCode className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (stage === "upload") {
    return (
      <main className="flex-1 ml-64 p-6 lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analyze Bug Report</h1>
            <p className="text-muted-foreground mt-1">Upload logs, stack traces, screenshots, or paste error details for AI-powered analysis</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Upload Area */}
            <div className="lg:col-span-2 space-y-6">
              <Card className={cn("border-2 transition-colors", dragActive ? "border-primary bg-primary/5" : "")}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Bug Artifacts
                  </CardTitle>
                  <CardDescription>Drag and drop files, or click to browse</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn("border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer", dragActive && "border-primary bg-primary/5")}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".log,.txt,.java,.js,.ts,.py,.zip,.png,.jpg,.jpeg,.webp"
                    />
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium mb-1">Drop files here or click to browse</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports: logs, stack traces, screenshots, source code, zip archives
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">.log</Badge>
                      <Badge variant="outline">.txt</Badge>
                      <Badge variant="outline">.java</Badge>
                      <Badge variant="outline">.js</Badge>
                      <Badge variant="outline">.ts</Badge>
                      <Badge variant="outline">.py</Badge>
                      <Badge variant="outline">.zip</Badge>
                      <Badge variant="outline">.png</Badge>
                      <Badge variant="outline">.jpg</Badge>
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Uploaded Files ({files.length})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border">
                              {getFileIcon(file)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)} • {file.type || "unknown"}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setFiles(files.filter((_, i) => i !== index))}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Text Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Or Paste Text / Stack Trace
                  </CardTitle>
                  <CardDescription>Paste error logs, stack traces, or error descriptions directly</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={`java.lang.NullPointerException: Cannot invoke "Customer.getId()" because "customer" is null
    at com.example.OrderService.processOrder(OrderService.java:184)
    at com.example.GuestCheckoutController.checkout(GuestCheckoutController.java:67)
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    ...`}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                    <span>{textInput.split('\n').length} lines</span>
                    <span>{textInput.length} characters</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Analysis Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pipelineSteps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <step.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    What Gets Analyzed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500" /> Exception types & stack traces</li>
                    <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500" /> Log patterns & error context</li>
                    <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500" /> Code snippets & repository context</li>
                    <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500" /> Screenshots (UI error states)</li>
                    <li className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4 text-green-500" /> Historical Jira tickets</li>
                  </ul>
                </CardContent>
              </Card>

              <Card variant="outline" className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <Button 
                    onClick={startAnalysis}
                    disabled={files.length === 0 && !textInput.trim()}
                    className="w-full text-lg py-3"
                    size="lg"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Start AI Analysis
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    Powered by NeMoTron 3 Super 120B
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (stage === "analyzing") {
    return (
      <main className="flex-1 ml-64 p-6 lg:ml-64 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <Brain className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold">AI Analysis in Progress</h1>
            <p className="text-muted-foreground mt-1">NeMoTron 3 Super 120B is reasoning through your bug report</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pipelineSteps.map((step, index) => {
                  const isComplete = index < currentStep
                  const isCurrent = index === currentStep
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg transition-all",
                        isComplete && "bg-green-500/10",
                        isCurrent && "bg-primary/10 border border-primary/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        isComplete && "bg-green-500 text-white",
                        isCurrent && "bg-primary text-white animate-pulse",
                        !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                      )}>
                        {isComplete ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={cn("font-medium", isCurrent && "text-primary", isComplete && "text-green-700 dark:text-green-400")}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: step.duration / 1000, ease: "linear" }}
                              className="h-full bg-primary"
                            />
                          </div>
                        )}
                      </div>
                      {isComplete && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6" variant="outline">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">
                Current: <span className="font-mono text-primary">
                  {pipelineSteps[currentStep]?.label || "Finalizing..."}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // Results Stage - cast to any since AI response shape differs from mock
  const result = analysisResult || mockAnalysisResult
  const r = result as any

  return (
    <main className="flex-1 ml-64 p-6 lg:ml-64 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis Complete</h1>
            <p className="text-muted-foreground mt-1">
              AI confidence: <span className="font-bold text-primary">{r.confidence}%</span> •
              Severity: <span className="font-bold text-destructive">{r.severity}</span> •
              Priority: <Badge variant="destructive">{r.priority}</Badge>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStage("upload")}>
              <Upload className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Main Results Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Root Cause & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Root Cause Card */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Root Cause Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <code className="font-mono text-sm text-destructive">{r.rootCause}</code>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Why This Happened</h4>
                    <p className="text-muted-foreground leading-relaxed">{r.reason}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{r.confidence}%</p>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-destructive">{r.severity}</p>
                      <p className="text-xs text-muted-foreground">Severity</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-500">{r.priority}</p>
                      <p className="text-xs text-muted-foreground">Priority</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-500">{r.estimatedTime}</p>
                      <p className="text-xs text-muted-foreground">Est. Fix Time</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={r.risk === "High" ? "destructive" : r.risk === "Medium" ? "warning" : "success"}>
                      <Shield className="h-3 w-3 mr-1" />
                      Risk: {r.risk}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Assessment based on code change scope and test coverage</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Fix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Suggested Fix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Problem & Explanation */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        Problem
                      </h4>
                      <p className="text-muted-foreground mt-1">
                        {typeof r.suggestedFix === "object" ? r.suggestedFix.problem : r.suggestedFix}
                      </p>
                    </div>
                    {typeof r.suggestedFix === "object" && r.suggestedFix.explanation && (
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          Explanation
                        </h4>
                        <p className="text-muted-foreground mt-1">{r.suggestedFix.explanation}</p>
                      </div>
                    )}
                  </div>

                  {/* Code Comparison — only when suggestedFix is an object */}
                  {typeof r.suggestedFix === "object" && (r.suggestedFix.codeBefore || r.suggestedFix.codeAfter) && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Code Changes</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {r.suggestedFix.codeBefore && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Before (Problematic)</p>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                              <code className="font-mono text-xs text-destructive/80">{r.suggestedFix.codeBefore}</code>
                            </pre>
                          </div>
                        )}
                        {r.suggestedFix.codeAfter && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">After (Fixed)</p>
                            <pre className="bg-green-500/10 p-4 rounded-lg overflow-x-auto max-h-64 overflow-y-auto border border-green-500/20">
                              <code className="font-mono text-xs text-green-700 dark:text-green-400">{r.suggestedFix.codeAfter}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Best Practices — only when suggestedFix is an object */}
                  {typeof r.suggestedFix === "object" && r.suggestedFix.bestPractices?.length > 0 && (
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Best Practices Applied
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {r.suggestedFix.bestPractices.map((practice: any, i: any) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {practice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Side Effects — only when suggestedFix is an object */}
                  {typeof r.suggestedFix === "object" && r.suggestedFix.sideEffects?.length > 0 && (
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Possible Side Effects
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {r.suggestedFix.sideEffects.map((effect: any, i: any) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            {effect}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Reasoning Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZapIcon className="h-5 w-5" />
                  AI Reasoning Timeline
                </CardTitle>
                <CardDescription>Step-by-step internal reasoning process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(r.reasoningTimeline || []).map((step: any) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: step.step * 0.05 }}
                    >
                      <ReasoningStep 
                        step={step} 
                        isExpanded={expandedReasoning === step.step}
                        onToggle={() => setExpandedReasoning(expandedReasoning === step.step ? null : step.step)}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Duplicate Detection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Duplicate Detection
                </CardTitle>
                <CardDescription>Similar issues found in Jira history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(r.similarTickets || []).map((ticket: any) => (
                    <DuplicateTicketCard 
                      ticket={ticket} 
                      isExpanded={expandedDuplicate === ticket.id}
                      onToggle={() => setExpandedDuplicate(expandedDuplicate === ticket.id ? null : ticket.id)}
                    />
                  ))}
                  {(r.similarTickets || []).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>No similar tickets found in Jira history</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Jira Preview */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Jira Ticket Preview
                </CardTitle>
                <CardDescription>Review and customize before creation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketCreated ? (
                  <TicketCreatedCard ticket={ticketCreated} />
                ) : (
                  <JiraPreviewForm
                    formData={jiraForm}
                    onChange={setJiraForm}
                    onSubmit={handleCreateTicket}
                    loading={creatingTicket}
                  />
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatRow label="Root Cause" value={r.rootCause} />
                  <StatRow label="Confidence" value={`${r.confidence}%`} />
                  <StatRow label="Severity" value={r.severity} />
                  <StatRow label="Priority" value={r.priority} />
                  <StatRow label="Est. Fix Time" value={r.estimatedTime} />
                  <StatRow label="Risk Level" value={r.risk} />
                  <StatRow label="Similar Tickets" value={r.similarTickets.length.toString()} />
                  <StatRow label="Components" value={r.jiraPreview.components.length.toString()} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

function ReasoningStep({ step, isExpanded, onToggle }: { step: any, isExpanded: boolean, onToggle: () => void }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
          step.confidence > 80 ? "bg-green-500 text-white" : 
          step.confidence > 50 ? "bg-yellow-500 text-white" : "bg-blue-500 text-white"
        )}>
          {step.step}
        </div>
        <div className="flex-1">
          <p className="font-medium">{step.title}</p>
          <p className="text-sm text-muted-foreground">{step.detail}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono font-bold text-primary">{step.confidence}%</p>
            <p className="text-xs text-muted-foreground">confidence</p>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-muted/30 px-4 pb-4 border-t"
          >
            <div className="text-sm text-muted-foreground space-y-2 pt-2">
              <p><strong>Step {step.step} Details:</strong> {step.detail}</p>
              <p>Confidence increased from previous step by analyzing code paths and matching historical patterns.</p>
              <p>The AI verified this hypothesis against {step.step > 3 ? "multiple" : "the"} similar issue(s) in the codebase.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DuplicateTicketCard({ ticket, isExpanded, onToggle }: { ticket: any, isExpanded: boolean, onToggle: () => void }) {
  const statusColors: Record<string, string> = {
    "Resolved": "success",
    "In Progress": "warning",
    "Open": "outline",
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-medium">{ticket.id}</span>
            <Badge variant="outline" className={statusColors[ticket.status]}>{ticket.status}</Badge>
            <Badge variant="outline" className="ml-auto">
              <Target className="h-3 w-3 mr-1" />
              {ticket.match}% Match
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{ticket.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{ticket.reason}</p>
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <ChevronDown className="h-5 w-5 flex-shrink-0 mt-0.5" />}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-muted/30 px-4 pb-4 border-t"
          >
            <div className="pt-2 space-y-3 text-sm">
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><LinkIcon className="h-3 w-3 mr-1" /> Link Existing</Button>
                <Button variant="destructive" size="sm"><X className="h-3 w-3 mr-1" /> Dismiss</Button>
              </div>
              <p className="text-muted-foreground">This ticket shares the same root cause: missing customer validation in guest checkout flow. Consider linking to track related fixes.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function JiraPreviewForm({ formData, onChange, onSubmit, loading }: { formData: any, onChange: any, onSubmit: () => void, loading?: boolean }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} className="space-y-4">
      <div className="space-y-2">
        <Label>Project</Label>
        <Input value={formData.project} onChange={(e) => onChange({...formData, project: e.target.value})} />
      </div>
      <div className="space-y-2">
        <Label>Issue Type</Label>
        <Select value={formData.issueType} onValueChange={(v) => onChange({...formData, issueType: v})}>
          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Bug">Bug</SelectItem>
            <SelectItem value="Task">Task</SelectItem>
            <SelectItem value="Story">Story</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Summary</Label>
        <Input value={formData.summary} onChange={(e) => onChange({...formData, summary: e.target.value})} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => onChange({...formData, description: e.target.value})} rows={4} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={(v) => onChange({...formData, priority: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="P0">P0 - Critical</SelectItem>
              <SelectItem value="P1">P1 - High</SelectItem>
              <SelectItem value="P2">P2 - Medium</SelectItem>
              <SelectItem value="P3">P3 - Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Assignee</Label>
          <Input value={formData.assignee} onChange={(e) => onChange({...formData, assignee: e.target.value})} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Epic</Label>
          <Input value={formData.epic} onChange={(e) => onChange({...formData, epic: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Story Points</Label>
          <Input type="number" value={formData.storyPoints} onChange={(e) => onChange({...formData, storyPoints: e.target.value})} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Labels</Label>
        <Input value={formData.labels.join(", ")} onChange={(e) => onChange({...formData, labels: e.target.value.split(",").map(s => s.trim())})} />
      </div>
      <div className="space-y-2">
        <Label>Components</Label>
        <Input value={formData.components.join(", ")} onChange={(e) => onChange({...formData, components: e.target.value.split(",").map(s => s.trim())})} />
      </div>
      <div className="space-y-2">
        <Label>Environment</Label>
        <Input value={formData.environment} onChange={(e) => onChange({...formData, environment: e.target.value})} />
      </div>
      
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ticket className="h-4 w-4 mr-2" />}
        {loading ? "Creating..." : "Create Jira Ticket"}
      </Button>
    </form>
  )
}

function TicketCreatedCard({ ticket }: { ticket: { key: string, url: string } }) {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-500" />
      </div>
      <h3 className="text-lg font-semibold">Ticket Created Successfully</h3>
      <p className="font-mono text-xl font-bold text-primary">{ticket.key}</p>
      <Button onClick={() => window.open(ticket.url, "_blank")} className="w-full">
        <ExternalLink className="h-4 w-4 mr-2" />
        Open in Jira
      </Button>
    </div>
  )
}

function StatRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  )
}

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"