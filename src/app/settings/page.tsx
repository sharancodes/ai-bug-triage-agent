"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { 
  Settings, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Mail,
  Key,
  Briefcase,
  Calendar,
  Tag,
  Box,
  User,
  Shield,
  Loader2,
  Info,
  Bug,
  Database,
  Palette,
  Cpu,
  Link2,
  Code,
  Triangle,
  Zap,
  Brain,
  Search,
  Ticket
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const defaultSettings = {
  jiraUrl: "https://sharanhitam.atlassian.net",
  jiraEmail: "your-email@domain.com",
  jiraApiToken: "",
  defaultProject: "PROJ",
  defaultSprint: "Sprint 1",
  defaultLabels: "bug,backend,ai-triage",
  defaultComponents: "Backend,API",
  defaultAssignee: "unassigned",
}

export default function SettingsPage() {
  const [settings, setSettings] = React.useState(defaultSettings)
  const [showToken, setShowToken] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null)
  const [testing, setTesting] = React.useState(false)

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setSaved(false)
    setTestResult(null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error("Save failed")
      setSaved(true)
      toast({ title: "Settings saved successfully" })
    } catch (error) {
      toast({ title: "Failed to save settings", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!settings.jiraUrl || !settings.jiraEmail || !settings.jiraApiToken) {
      setTestResult({ success: false, message: "Please fill in all Jira credentials first" })
      return
    }
    setTesting(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jiraUrl: settings.jiraUrl,
          jiraEmail: settings.jiraEmail,
          jiraApiToken: settings.jiraApiToken,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Connection failed")
      setTestResult({ success: true, message: data.message })
    } catch (error) {
      setTestResult({ success: false, message: (error as Error).message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <main className="flex-1 ml-64 p-6 lg:ml-64 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">Configure Jira integration and default values</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}
          </Button>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Settings saved successfully!</span>
          </motion.div>
        )}

        <Tabs defaultValue="jira" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jira">
              <Globe className="h-4 w-4 mr-2" />
              Jira Integration
            </TabsTrigger>
            <TabsTrigger value="defaults">
              <Settings className="h-4 w-4 mr-2" />
              Default Values
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Shield className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="about">
              <Info className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          {/* Jira Integration Tab */}
          <TabsContent value="jira" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Jira Cloud Configuration
                </CardTitle>
                <CardDescription>
                  Configure connection to your Jira Cloud instance. 
                  <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                    Generate API token
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="jiraUrl">Jira URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="jiraUrl"
                        placeholder="https://sharanhitam.atlassian.net"
                        value={settings.jiraUrl}
                        onChange={(e) => handleChange("jiraUrl", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jiraEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="jiraEmail"
                        type="email"
                        placeholder="dev@company.com"
                        value={settings.jiraEmail}
                        onChange={(e) => handleChange("jiraEmail", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jiraApiToken">API Token</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="jiraApiToken"
                      type={showToken ? "text" : "password"}
                      placeholder="••••••••••••••••"
                      value={settings.jiraApiToken}
                      onChange={(e) => handleChange("jiraApiToken", e.target.value)}
                      className="pl-10 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your API token is stored encrypted. Generate one at 
                    <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="underline">
                      Atlassian Account Security
                    </a>
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Connection Test</h4>
                    <p className="text-sm text-muted-foreground">Verify your Jira credentials are working correctly</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleTestConnection} 
                    disabled={testing || !settings.jiraUrl || !settings.jiraEmail || !settings.jiraApiToken}
                    className="gap-2"
                  >
                    {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test Connection"}
                  </Button>
                </div>

                {testResult && (
                  <div className={cn(
                    "p-4 rounded-lg flex items-center gap-3",
                    testResult.success 
                      ? "bg-green-500/10 border border-green-500/20 text-green-500" 
                      : "bg-red-500/10 border border-red-500/20 text-red-500"
                  )}>
                    {testResult.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Default Values Tab */}
          <TabsContent value="defaults" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Default Project Settings
                </CardTitle>
                <CardDescription>
                  These values will be pre-filled when creating new Jira tickets from analyses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultProject">Default Project Key</Label>
                    <Input
                      id="defaultProject"
                      placeholder="PROJ"
                      value={settings.defaultProject}
                      onChange={(e) => handleChange("defaultProject", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultSprint">Default Sprint</Label>
                    <Input
                      id="defaultSprint"
                      placeholder="Sprint 1"
                      value={settings.defaultSprint}
                      onChange={(e) => handleChange("defaultSprint", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultAssignee">Default Assignee</Label>
                  <Input
                    id="defaultAssignee"
                    placeholder="unassigned or username"
                    value={settings.defaultAssignee}
                    onChange={(e) => handleChange("defaultAssignee", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultLabels">Default Labels (comma-separated)</Label>
                  <Input
                    id="defaultLabels"
                    placeholder="bug,backend,ai-triage"
                    value={settings.defaultLabels}
                    onChange={(e) => handleChange("defaultLabels", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Applied to all AI-generated tickets</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultComponents">Default Components (comma-separated)</Label>
                  <Input
                    id="defaultComponents"
                    placeholder="Backend,API"
                    value={settings.defaultComponents}
                    onChange={(e) => handleChange("defaultComponents", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Ticket Template Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                  {`{
  "fields": {
    "project": { "key": "${settings.defaultProject}" },
    "issuetype": { "name": "Bug" },
    "summary": "[AI] NullPointerException in OrderService.java:184",
    "description": "**Root Cause**\\nCustomer object is null because validation was skipped during guest checkout.\\n\\n**AI Analysis**\\n- Confidence: 92%\\n- Severity: High\\n- Priority: P1\\n- Estimated Fix Time: 30 minutes\\n\\n**Suggested Fix**\\n\`\`\`java\\nif (customer == null) {\\n  throw new IllegalArgumentException("Customer cannot be null");\\n}\\n\`\`\`\\n\\n**Steps to Reproduce**\\n1. Start guest checkout flow\\n2. Add items to cart\\n3. Proceed to payment\\n4. Submit order\\n5. Observe NPE\\n\\n**Expected Behavior**\\nGuest checkout creates temporary customer\\n\\n**Actual Behavior**\\nNPE at OrderService.java:184",
    "priority": { "name": "High" },
    "labels": ["${settings.defaultLabels.split(",").join('","')}"],
    "components": [{ "name": "Backend" }, { "name": "API" }],
    "assignee": { "accountId": "${settings.defaultAssignee}" },
    "customfield_10002": 3
  }
}`}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>
                  Fine-tune AI behavior and integration options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-create Jira tickets</h4>
                      <p className="text-sm text-muted-foreground">Automatically create tickets for high-confidence analyses (P0/P1)</p>
                    </div>
                    <Button variant="outline" className="w-[60px] h-6 text-xs">Off</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Include AI reasoning in ticket</h4>
                      <p className="text-sm text-muted-foreground">Attach full reasoning timeline to ticket description</p>
                    </div>
                    <Button variant="default" className="w-[60px] h-6 text-xs">On</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Duplicate detection</h4>
                      <p className="text-sm text-muted-foreground">Search existing tickets before creating new ones</p>
                    </div>
                    <Button variant="default" className="w-[60px] h-6 text-xs">On</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Attach raw logs to ticket</h4>
                      <p className="text-sm text-muted-foreground">Include uploaded log files as ticket attachments</p>
                    </div>
                    <Button variant="default" className="w-[60px] h-6 text-xs">On</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notify assignee on creation</h4>
                      <p className="text-sm text-muted-foreground">Send Jira notification when ticket is created</p>
                    </div>
                    <Button variant="default" className="w-[60px] h-6 text-xs">On</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Clear analysis history</h4>
                    <p className="text-sm text-muted-foreground">Remove all stored analyses and reasoning data</p>
                  </div>
                  <Button variant="destructive" className="gap-2">Clear History</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Export all data</h4>
                    <p className="text-sm text-muted-foreground">Download all analyses and tickets as JSON</p>
                  </div>
                  <Button variant="outline" className="gap-2">Export JSON</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About AI Bug Triage Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
                    <Bug className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Bug Triage Agent</h3>
                    <p className="text-muted-foreground">Version 1.0.0 (MVP)</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Powered by</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2"><Zap className="h-4 w-4" /> NeMoTron 3 Super 120B (NVIDIA)</li>
                    <li className="flex items-center gap-2"><Triangle className="h-4 w-4" /> Next.js 14 + React 18 + TypeScript</li>
                    <li className="flex items-center gap-2"><Palette className="h-4 w-4" /> Tailwind CSS + shadcn/ui</li>
                    <li className="flex items-center gap-2"><Cpu className="h-4 w-4" /> Framer Motion for animations</li>
                    <li className="flex items-center gap-2"><Database className="h-4 w-4" /> SQLite with Prisma ORM</li>
                    <li className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Jira REST API integration</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Features</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <FeatureItem icon={Brain} title="AI Root Cause Analysis" desc="Identifies probable root cause with confidence scoring" />
                    <FeatureItem icon={Code} title="Code Fix Suggestions" desc="Generates before/after code snippets with best practices" />
                    <FeatureItem icon={Search} title="Duplicate Detection" desc="Finds similar Jira tickets with match percentages" />
                    <FeatureItem icon={Ticket} title="Auto Jira Ticket Creation" desc="One-click ticket generation with full context" />
                    <FeatureItem icon={Zap} title="Animated Pipeline" desc="Real-time visualization of AI reasoning steps" />
                    <FeatureItem icon={Shield} title="Enterprise UI" desc="Linear/GitHub inspired dark-mode dashboard" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Hackathon Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Built for the AI Bug Triage Agent hackathon. Demonstrates production-quality AI-assisted debugging
                    workflow with structured reasoning, code suggestions, and seamless ticket management integration.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

function FeatureItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
