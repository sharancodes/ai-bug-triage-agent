# AI Bug Triage Agent

An AI-powered bug triage assistant that analyzes logs, stack traces, screenshots, and repository context to identify root causes, suggest fixes, and automatically create Jira tickets.

## Features

- 📤 **Multi-format Input** - Upload logs, stack traces, screenshots, source code, or paste text directly
- 🤖 **AI-Powered Analysis** - Powered by NeMoTron 3 Super 120B for intelligent root cause analysis
- 🔍 **Root Cause Detection** - Identifies probable root cause with confidence scoring (0-100%)
- 🐛 **Code Fix Suggestions** - Generates before/after code snippets with best practices
- 🎯 **Priority & Severity** - Recommends P0-P3 priority and Critical/Low severity
- 👥 **Assignee & Component Recommendations** - Suggests team, components, and labels
- 🔎 **Duplicate Detection** - Searches existing Jira tickets for similar issues
- 🎫 **One-Click Jira Creation** - Generates professional tickets with full context
- 📊 **Dashboard** - Analytics, history, and confidence trends
- 🎨 **Enterprise UI** - Dark mode, animations, Linear/GitHub-inspired design

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite with Prisma ORM
- **AI**: NeMoTron 3 Super 120B (simulated for MVP)
- **Integration**: Jira REST API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-bug-triage-agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize database
npm run db:push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Database
DATABASE_URL="file:./dev.db"

# Jira Configuration
JIRA_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token

# AI Configuration (for future integration)
NEMOTRON_API_KEY=your-nemotron-api-key

# Default Settings
DEFAULT_PROJECT=PROJ
DEFAULT_SPRINT=Sprint 1
DEFAULT_LABELS=bug,backend,ai-triage
DEFAULT_COMPONENTS=Backend,API
DEFAULT_ASSIGNEE=unassigned
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # AI analysis endpoint
│   │   ├── jira/route.ts         # Jira ticket creation
│   │   ├── settings/route.ts     # Settings management
│   │   └── history/route.ts      # Analysis history
│   ├── analyze/page.tsx          # Bug analysis page
│   ├── history/page.tsx          # Analysis history
│   ├── jira/page.tsx             # Jira tickets management
│   ├── settings/page.tsx         # Settings page
│   ├── page.tsx                  # Dashboard
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── dashboard-layout.tsx      # Layout wrapper
│   └── theme-provider.tsx        # Theme provider
├── lib/
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Utility functions
└── prisma/
    └── schema.prisma             # Database schema
```

## Usage

### 1. Analyze a Bug

1. Navigate to **Analyze Bug** from the sidebar
2. Upload files (logs, stack traces, screenshots, source code) or paste text
3. Click **Start AI Analysis**
4. Watch the animated pipeline as AI processes your input
5. Review results: root cause, confidence, suggested fix, duplicates

### 2. Create Jira Ticket

1. After analysis, review the Jira preview panel on the right
2. Customize any fields (project, priority, labels, assignee, etc.)
3. Click **Create Jira Ticket**
4. Open the ticket directly in Jira

### 3. View History

- **Dashboard**: Overview stats and recent analyses
- **History**: Searchable table of all past analyses
- **Jira Tickets**: Manage created tickets

## Sample Test Data

### NullPointerException Stack Trace
```
java.lang.NullPointerException: Cannot invoke "Customer.getId()" because "customer" is null
    at com.example.OrderService.processOrder(OrderService.java:184)
    at com.example.GuestCheckoutController.checkout(GuestCheckoutController.java:67)
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
    at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
    at java.base/java.lang.reflect.Method.invoke(Method.java:566)
    at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:190)
    at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:138)
```

### OutOfMemoryError Stack Trace
```
java.lang.OutOfMemoryError: Java heap space
    at java.base/java.util.Arrays.copyOf(Arrays.java:3538)
    at java.base/java.lang.AbstractStringBuilder.ensureCapacityInternal(AbstractStringBuilder.java:162)
    at java.base/java.lang.StringBuilder.append(StringBuilder.java:123)
    at com.example.DataProcessor.processLargeFile(DataProcessor.java:245)
    at com.example.ETLJob.run(ETLJob.java:89)
    at java.base/java.lang.Thread.run(Thread.java:829)
```

## API Endpoints

### POST /api/analyze
Analyze bug report from uploaded files or text.

**Request**: FormData with `files` (File[]) and `text` (string)

**Response**:
```json
{
  "id": "analysis-id",
  "rootCause": "NullPointerException in OrderService.java:184",
  "reason": "Customer object is null because validation was skipped...",
  "confidence": 92,
  "severity": "High",
  "priority": "P1",
  "estimatedTime": "30 minutes",
  "risk": "Medium",
  "suggestedFix": { "problem": "...", "explanation": "...", "codeBefore": "...", "codeAfter": "...", "bestPractices": [], "sideEffects": [] },
  "similarTickets": [{ "id": "BUG-143", "match": 96, "reason": "..." }],
  "jiraPreview": { "project": "PROJ", "summary": "...", "description": "...", ... }
}
```

### POST /api/jira
Create Jira ticket from analysis.

**Request**: Jira ticket fields

**Response**: `{ "success": true, "ticketKey": "PROJ-123", "url": "https://..." }`

### GET /api/history
Get analysis history.

### GET/PUT /api/settings
Manage Jira and default settings.

## Database Schema

- **Analysis**: Stores root cause, reasoning, confidence, suggested fix, similar tickets
- **JiraTicket**: Links analyses to created Jira tickets
- **Settings**: Jira credentials and default values

## Future Extensibility

The architecture supports easy addition of:
- GitHub/GitLab/Azure DevOps integrations
- Slack/Teams notifications
- Sentry/Datadog/New Relic/Elastic integrations
- Custom AI models
- Webhook support
- Team collaboration features

## License

MIT License - Built for hackathon demonstration.

## Acknowledgments

- NVIDIA NeMoTron 3 Super 120B for AI reasoning
- shadcn/ui for beautiful components
- Linear, GitHub, Vercel for design inspiration