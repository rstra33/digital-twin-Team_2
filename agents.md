# Digital Twin MCP Server Project Instructions

## Project Overview
Build an MCP server using the roll dice pattern to create a digital twin assistant that can answer questions about a person's professional profile using RAG (Retrieval-Augmented Generation).

## Tech Stack
- **Language**: Python 3.10+
- **Vector Database**: Upstash Vector (REST API via SDK)
- **LLM Provider**: Groq with LLaMA model
- **MCP Protocol**: Model Context Protocol for tool-calling
- **Data Format**: JSON (structured professional profiles)
- **Package Manager**: pip

## Architecture & Code Structure
The Digital Twin consists of:
- `digitaltwin.json` — Structured professional profile data (name, experience, skills, etc.)
- `digitaltwin_rag.py` — Core RAG application (main entry point)
- `agents.md` — This file; AI agent instructions and behaviour rules
### How It Works
1. Profile data from `digitaltwin.json` is chunked and embedded
2. Embeddings are stored in Upstash Vector database
3. When an interview question is asked, semantic search retrieves relevant profile chunks
4. Groq LLaMA synthesises professional answers using retrieved evidence
5. MCP tools handle the vector search and LLM calls
6. Final output: Markdown hiring recommendation report

## Reference Repositories
- **Pattern Reference**: https://github.com/gocallum/rolldice-mcpserver.git
  - Roll dice MCP server - use same technology and pattern for our MCP server
- **Logic Reference**: https://github.com/gocallum/binal_digital-twin_py.git
  - Python code using Upstash Vector for RAG search with Groq and LLaMA for generations

## References & Documentation
### MCP & Vector Search
- **MCP Protocol**: https://modelcontextprotocol.io/introduction
- **Pattern Reference**: https://github.com/gocallum/rolldice-mcpserver.git
- **Logic Reference**: https://github.com/gocallum/binal_digital-twin_py.git

### Core Technologies
- **Upstash Vector**: https://upstash.com/docs/vector/overall/getstarted
- **Groq API**: https://console.groq.com/docs/openai
- **LangChain RAG**: https://python.langchain.com/docs/tutorials/rag/
- **Anthropic Claude**: https://docs.anthropic.com
 
## Core Functionality
- MCP server accepts user questions about the person's professional background
- Create server actions that search Upstash Vector database and return RAG results
- Search logic must match the Python version exactly

## Environment Variables (.env.local)
```
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
GROQ_API_KEY=
```

## Technical Requirements
- **Framework**: Next.js 15.5.3+ (use latest available)
- **Package Manager**: Always use pnpm (never npm or yarn)
- **Commands**: Always use Windows PowerShell commands
- **Type Safety**: Enforce strong TypeScript type safety throughout
- **Architecture**: Always use server actions where possible
- **Styling**: Use globals.css instead of inline styling
- **UI Framework**: ShadCN with dark mode theme
- **Focus**: Prioritize MCP functionality over UI - UI is primarily for MCP server configuration

## Setup Commands
```bash
pnpm dlx shadcn@latest init
```
Reference: https://ui.shadcn.com/docs/installation/next

## Upstash Vector Integration

### Key Documentation
- Getting Started: https://upstash.com/docs/vector/overall/getstarted
- Embedding Models: https://upstash.com/docs/vector/features/embeddingmodels
- TypeScript SDK: https://upstash.com/docs/vector/sdks/ts/getting-started

### Example Implementation
```typescript
import { Index } from "@upstash/vector"

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

// RAG search example
await index.query({
  data: "What is Upstash?",
  topK: 3,
  includeMetadata: true,
})
```

## Requirements Location
- **Product Requirements Document**: [docs/prd.md](docs/prd.md)

## Additional Useful Resources
- Add any other relevant documentation links as needed
- Include specific API references for integrations
- Reference MCP protocol specifications
- Add deployment and testing guidelines

---

**Note**: This file provides context for GitHub Copilot to generate accurate, project-specific code suggestions. Keep it updated as requirements evolve.


## Contribution by Vishva Patel
- Reviewed repository setup and added initial notes



## ARCHITECTURE (CONCEPTUAL):
```
 ┌────────────────────────────────────────────────────────────────┐
 │                  Visual Studio Code (Agent Mode)               │
 │                                                                │
 │     ┌────────────────────────────────────────────────────┐     │
 │     │ Agentic LLM (Claude Sonnet / Opus / Groq Fast)     │     │
 │     │ - Reads job description + agent instructions       │     │
 │     │ - Conducts interview autonomously                  │     │
 │     │ - Decides when to retrieve information             │     │
 │     │ - Generates structured answers + final report      │     │
 │     └────────────────────────────────────────────────────┘     │
 │                         ▲            │                         │
 │                         │ Tool Call  │                         │
 │                         │            ▼                         │
 │     ┌────────────────────────────────────────────────────┐     │
 │     │ MCP Retrieval Tool                                 │     │
 │     │ - Accepts search queries from LLM                  │     │
 │     │ - Converts query into embeddings                   │     │
 │     │ - Queries vector database                          │     │
 │     │ - Returns relevant facts for evidence              │     │
 │     └────────────────────────────────────────────────────┘     │
 │                                                                │
 └────────────────────────────────────────────────────────────────┘
                      │
                      │ Vector Search
                      ▼
 ┌────────────────────────────────────────────────────────────────┐
 │                     Vector Database (Upstash Vector)           │
 │ - Stores all embedded profile chunks                           │
 │ - Semantic similarity search                                   │
 │ - Returns best matched documents                               │
 └────────────────────────────────────────────────────────────────┘
                      │
                      │ Optional Data Storage
                      ▼
 ┌────────────────────────────────────────────────────────────────┐
 │                  Relational Database (Neon Postgres)           │
 │ - Stores interview transcripts                                 │
 │ - Stores performance analytics                                 │
 │ - Enables dashboards and insights                              │
 └────────────────────────────────────────────────────────────────┘

                 ┌──────────────────────────────────────┐
                 │     Profile Data Preparation         │
                 │  (Structured JSON, Chunked Content)  │
                 │ - Your experience, skills, metrics   │
                 │ - Stored locally (not in GitHub)     │
                 └──────────────────────────────────────┘
```
