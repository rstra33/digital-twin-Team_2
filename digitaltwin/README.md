# Digital Twin — RAG-Powered Interview Agent

An AI-powered Digital Twin that conducts professional job interviews on your behalf using Retrieval-Augmented Generation (RAG). The system stores your real professional profile in a vector database, retrieves relevant evidence via semantic search, and generates factual, grounded interview responses — never hallucinating or inventing information.

Built as part of the AusBiz Consulting Digital Twin project (Team 2).

## How It Works

```
Job Description ──→ Agentic LLM (Claude / Groq)
                        │
                        ├── Reads interview instructions (AGENTS.md)
                        ├── Generates interview questions
                        ├── Calls MCP tool for each question
                        │       │
                        │       ▼
                        │   Upstash Vector DB
                        │   (semantic search over profile embeddings)
                        │       │
                        │       ▼
                        ├── Retrieves relevant evidence chunks
                        ├── Synthesises professional answers
                        └── Produces final hiring recommendation report
```

**Embed** — Your structured profile JSON is chunked, embedded, and stored in Upstash Vector.  
**Retrieve** — When an interview question is asked, the MCP server performs semantic search to find the most relevant profile chunks.  
**Generate** — The LLM analyses the retrieved evidence and produces an accurate, first-person answer grounded in your real data.  
**Report** — After the full interview, a Markdown report is generated with transcript, evaluation, and a hire/no-hire recommendation.

---

## Team Members

| Name | GitHub |
|---|---|
| Ranne Sanedrin | [impulsifier](https://github.com/impulsifier) |
| Remi Strachan | [rstra33](https://github.com/rstra33) |
| Andrea Cuevas | [cuevasandrea676-bit](https://github.com/cuevasandrea676-bit) |
| Alaine Krizia | [alainekrizia](https://github.com/alainekrizia) |
| Rabib Islam | [rabib773](https://github.com/rabib773) |
| Jose Pablo Du | [jsepblo](https://github.com/jsepblo) |

---

## Repository Structure

```
digital-twin-Team_2/
├── digitaltwin/
│   ├── .vscode/
│   │   └── mcp.json                    ← VS Code MCP client configuration
│   ├── app/                            ← Next.js app directory
│   │   ├── actions/
│   │   │   └── mcp-actions.ts          ← MCP server actions
│   │   ├── api/
│   │   │   └── [transport]/
│   │   │       └── route.ts            ← MCP transport API route
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── docs/                           ← Project documentation
│   │   ├── performance/                ← Performance benchmarks and results
│   │   ├── presentation-outline/       ← Presentation outline files
│   │   ├── design.md                   ← Technical Design Document
│   │   ├── implementation-plan.md      ← Implementation plan
│   │   └── prd.md                      ← Product Requirements Document
│   ├── jobs/                           ← Job description files
│   │   ├── job1.md
│   │   ├── job2.md
│   │   ├── job3.md
│   │   ├── job4.md
│   │   ├── job5.md
│   │   └── job6.md
│   ├── lib/                            ← Shared utility libraries
│   │   ├── chunker.ts                  ← Profile chunking logic
│   │   ├── digital-twin.ts             ← Digital twin core utilities
│   │   └── logger.ts                  ← Logging utilities
│   ├── public/                         ← Next.js static assets
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── .gitignore                      ← Prevents secrets from being committed
│   ├── README.md                       ← Project documentation
│   ├── agents.md                       ← Interview agent instructions and rules
│   ├── digitaltwin.json                ← Structured professional profile data (git-ignored — stored locally only)
│   ├── digitaltwin_rag.py              ← Core RAG pipeline (Upstash Vector + Groq)
│   ├── eslint.config.mjs               ← ESLint configuration
│   ├── next-env.d.ts                   ← Next.js TypeScript declarations
│   ├── next.config.ts                  ← Next.js configuration
│   ├── package-lock.json               ← npm lock file
│   ├── package.json                    ← Node.js dependencies
│   ├── pnpm-lock.yaml                  ← pnpm lock file
│   ├── postcss.config.mjs              ← PostCSS configuration
│   └── tsconfig.json                   ← TypeScript configuration
├── .gitignore                          ← Root gitignore
└── README.md                           ← Root project documentation
```

---

## Key Files

| File | Purpose |
|---|---|
| [digitaltwin_rag.py](digitaltwin/digitaltwin_rag.py) | Core pipeline — connects to Upstash Vector, performs semantic search, generates responses via Groq |
| [digitaltwin.json](digitaltwin/digitaltwin.json) | Your professional profile structured into embeddable content chunks (git-ignored — not committed to repo) |
| [agents.md](digitaltwin/agents.md) | Instructions defining how the AI interviewer should behave, evaluate, and report |
| [.vscode/mcp.json](digitaltwin/.vscode/mcp.json) | MCP server configuration for VS Code Agent Mode |
| [docs/prd.md](digitaltwin/docs/prd.md) | Product Requirements Document outlining scope, timeline, and success criteria |
| [docs/design.md](digitaltwin/docs/design.md) | Technical Design Document |
| [docs/implementation-plan.md](digitaltwin/docs/implementation-plan.md) | Implementation plan and milestones |

---

## Tech Stack

| Component | Technology |
|---|---|
| MCP Server | Next.js API route (Streamable HTTP transport) |
| Vector Database | Upstash Vector (built-in embeddings) |
| LLM Inference | Groq (llama-3.1-8b-instant) |
| Agent Mode | VS Code Insiders + GitHub Copilot (Claude Sonnet 4.5) |
| Tool Calling | MCP (Model Context Protocol) |
| Languages | Python (RAG pipeline) + TypeScript (MCP server) |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- Python 3.11.9 (recommended — earlier or later versions may cause dependency issues)
- Node.js 18+
- pnpm (install via `npm install -g pnpm`)
- VS Code Insiders (required for Agent Mode)
- GitHub Copilot Pro subscription (for agentic LLM tool-calling)
- Upstash account with a Vector index created
- Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/rstra33/digital-twin-Team_2.git
cd digital-twin-Team_2/digitaltwin
```

### 2. Install dependencies

```bash
# Python dependencies (RAG pipeline)
pip install python-dotenv upstash-vector groq

# Node.js dependencies (MCP server)
pnpm install
```

### 3. Configure environment variables

Create a `.env` file inside the `digitaltwin/` folder with your keys:

```
GROQ_API_KEY=your_groq_api_key_here
UPSTASH_VECTOR_REST_URL=your_upstash_url_here
UPSTASH_VECTOR_REST_TOKEN=your_upstash_token_here
UPSTASH_VECTOR_REST_READONLY_TOKEN=your_upstash_readonly_token_here
RESET_UPSTASH_INDEX=true
```

> **Note:** `digitaltwin.json` is git-ignored and must be created locally by each team member. It contains your personal professional profile data and should never be committed to the repository.

### 4. Run the application

```bash
# Start the Next.js MCP server
pnpm dev

# Or run the Python RAG pipeline directly
py -3.11 digitaltwin_rag.py
```

The MCP server runs at `http://localhost:3000/api/mcp` and is configured via `.vscode/mcp.json`.

On first run of the Python script, it detects an empty database, reads `digitaltwin.json`, chunks it, and uploads embeddings to Upstash Vector. Subsequent runs skip this step unless `RESET_UPSTASH_INDEX=true` is set.

This launches an interactive chat loop where you can ask questions directly and see the RAG pipeline in action.

---

## Final Working Version

The main branch represents the final working version of this project.

---

## License

This project was developed for educational purposes as part of the AusBiz Consulting Digital Twin workshop.