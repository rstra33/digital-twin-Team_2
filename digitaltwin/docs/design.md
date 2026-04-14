# Technical Design Document — Digital Twin RAG Interview Agent
Generated from PRD using Claude | Team 2 | AusBiz Consulting Digital Twin Project

---

## 1. Overview
This document describes the technical design for the Digital Twin RAG Interview Agent.
The system enables an agentic LLM to autonomously conduct professional job interviews
on behalf of a candidate, using Retrieval-Augmented Generation (RAG) to retrieve
real profile data from a vector database and generate factual, grounded responses.

---

## 2. System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                 Visual Studio Code (Agent Mode)             │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │         Agentic LLM (Claude Sonnet / Groq)          │   │
│   │  - Reads job description + AGENTS.md instructions   │   │
│   │  - Generates interview questions autonomously       │   │
│   │  - Calls MCP tool for each question                 │   │
│   │  - Synthesises answers from retrieved evidence      │   │
│   │  - Generates final hiring recommendation report     │   │
│   └────────────────────┬────────────────────────────────┘   │
│                        │ MCP Tool Call                      │
│   ┌────────────────────▼────────────────────────────────┐   │
│   │              MCP Server (Python)                    │   │
│   │  - Exposes semantic_search() tool                   │   │
│   │  - Connects to Upstash Vector REST API              │   │
│   │  - Returns top-k relevant profile chunks            │   │
│   └────────────────────┬────────────────────────────────┘   │
│                        │ REST API                           │
│   ┌────────────────────▼────────────────────────────────┐   │
│   │           Upstash Vector Database                   │   │
│   │  - Stores embedded profile chunks                   │   │
│   │  - Built-in text embeddings                         │   │
│   │  - Semantic similarity search                       │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Components

### 3.1 Embedding Pipeline
- **Input:** `digitaltwin.json` — structured personal profile data
- **Process:** Profile is chunked into semantic units (experience, skills, education, etc.)
- **Output:** Vectors uploaded to Upstash Vector with metadata
- **File:** `digitaltwin_rag.py` → `build_chunks_from_profile()`

### 3.2 MCP Server
- **Purpose:** Exposes a `semantic_search` tool that the agentic LLM can call
- **Input:** Natural language query (interview question)
- **Process:** Performs semantic similarity search against Upstash Vector
- **Output:** Top-k relevant profile chunks with similarity scores
- **File:** `mcp-server/server.py`

### 3.3 Agent Orchestration
- **Purpose:** Autonomously conducts the full interview
- **Instructions:** Reads from `agents.md`
- **Process:**
  1. Reads job description from `/jobs` folder
  2. Generates contextually relevant interview questions
  3. Calls MCP tool for each question
  4. Synthesises grounded first-person answers
  5. Evaluates candidate fit
  6. Generates final Markdown report
- **File:** `agent/interviewer.py`

### 3.4 Report Generator
- **Purpose:** Produces final hiring recommendation report
- **Format:** Markdown
- **Contents:**
  - Candidate details
  - Full interview transcript
  - Per-question evidence citations
  - Hire / No-hire recommendation with justification
- **File:** `agent/report_generator.py`

### 3.5 Job Descriptions
- **Location:** `/jobs` folder
- **Format:** Markdown `.md` files
- **Purpose:** Used by agent to generate relevant interview questions

---

## 4. Data Flow
```
digitaltwin.json
      │
      ▼
build_chunks_from_profile()
      │
      ▼
Upstash Vector DB (embedded chunks)
      │
      ▼
MCP Server (semantic_search tool)
      │
      ▼
Agentic LLM (reads job description + AGENTS.md)
      │
      ├── Generates questions
      ├── Calls MCP tool per question
      ├── Retrieves relevant chunks
      ├── Synthesises answers
      │
      ▼
Final Markdown Report (hire/no-hire recommendation)
```

---

## 5. File Structure
```
digital-twin-Team_2/
├── README.md
├── AGENTS.md                  ← Agent behaviour instructions
├── digitaltwin.json           ← Personal profile data
├── digitaltwin_rag.py         ← Core RAG pipeline
├── docs/
│   ├── prd.md                 ← Product Requirements Document
│   ├── design.md              ← This document
│   └── implementation-plan.md ← Implementation plan
├── mcp-server/
│   └── server.py              ← MCP tool server
├── agent/
│   ├── interviewer.py         ← Interview orchestration
│   └── report_generator.py   ← Report generation
├── jobs/
│   └── example-role.md        ← Job description files
└── .gitignore
```

---

## 6. Tech Stack

| Component | Technology | Reason |
|---|---|---|
| Vector Database | Upstash Vector | Built-in embeddings, serverless, REST API |
| LLM Inference | Groq (llama-3.1-8b-instant) | Ultra-fast inference |
| Agent Mode | VS Code Insiders + GitHub Copilot | Option 1 — no UI required |
| Tool Calling | MCP (Model Context Protocol) | Standard agentic tool interface |
| Language | Python 3.10+ | Team familiarity |

---

## 7. Security Design

- All API keys stored in `.env` files locally
- `.gitignore` prevents `.env` from being committed
- No personal embeddings stored in GitHub
- `RESET_UPSTASH_INDEX` env flag controls database resets safely

---

## 8. Acceptance Criteria Mapping

| PRD Acceptance Criteria | Design Component |
|---|---|
| MCP server performs semantic search | MCP Server → `semantic_search()` |
| Agent generates questions autonomously | Agent Orchestration → `interviewer.py` |
| Agent retrieves relevant chunks | MCP tool call per question |
| Final report with recommendation | Report Generator → `report_generator.py` |
| All members have visible commits | GitHub branch + PR workflow |
| No secrets in repository | `.gitignore` + `.env` pattern |

---

## 9. Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `GROQ_API_KEY` | Groq LLM inference API key | ✅ Yes |
| `UPSTASH_VECTOR_REST_URL` | Upstash Vector database URL | ✅ Yes |
| `UPSTASH_VECTOR_REST_TOKEN` | Upstash Vector authentication token | ✅ Yes |
| `RESET_UPSTASH_INDEX` | Set to `true` to rebuild vector database | ⬜ Optional |

---

## 10. API Contracts

### MCP Tool: semantic_search
- **Input:** `query` (string) — natural language question from the interviewer
- **Parameters:** `top_k` (int, default 3) — number of results to return
- **Output:** Array of chunks with the following fields:
  - `title` — name of the profile section
  - `content` — relevant profile text
  - `score` — semantic similarity score (0.0 to 1.0)
  - `category` — chunk category (experience, skills, education, etc.)

### Groq LLM
- **Model:** `llama-3.1-8b-instant`
- **Temperature:** 0.7
- **Max tokens:** 500
- **System prompt:** First-person digital twin persona

---

## 11. Error Handling

| Scenario | Behaviour |
|---|---|
| `digitaltwin.json` not found | Print error message, return `None` |
| Upstash connection fails | Print error message, return `None` |
| Groq API key missing | Print error message, exit gracefully |
| Groq API call fails | Return error message string to user |
| Empty vector search results | Return "no specific information" message |
| Empty profile chunks built | Print error message, return `None` |
| Missing JSON keys (language, company) | Skip entry safely, continue processing |

---

## 12. Known Limitations

- Minimum 15 vectors required per member for meaningful retrieval
- `digitaltwin.json` must follow the expected schema with top-level keys: `personal`, `experience`, `skills`, `education`, `projects_portfolio`, `career_goals`
- MCP server must be running locally before agent can call tools
- Each team member must maintain their own separate Upstash Vector database
- `RESET_UPSTASH_INDEX=true` must be set on first run to upload vectors

---

## 13. Dependencies
```
python-dotenv>=1.0.0
upstash-vector>=0.5.0
groq>=0.4.0
```

Install with:
```bash
pip install python-dotenv upstash-vector groq
```

---

*This design was AI-generated from `docs/prd.md` using Claude and iteratively
improved through team review. Last updated: Week 2.*