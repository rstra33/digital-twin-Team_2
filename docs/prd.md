# Product Requirements Document — Digital Twin RAG Interview Agent
Built as part of the AusBiz Consulting Digital Twin project (Team 2).

---

## Project Overview
This project delivers an AI-powered Digital Twin that conducts professional job 
interviews on behalf of a candidate. The system uses Retrieval-Augmented Generation 
(RAG) to retrieve real profile data from a vector database and generate factual, 
grounded interview responses — never hallucinating or inventing information.

---

## Team Members

| Name | GitHub |
|---|---|
| Ranne Sanedrin | [impulsifier](https://github.com/impulsifier) |
| Remi Strachan | [rstra33](https://github.com/rstra33) |
| Vishva Patel | [vishva-patel187](https://github.com/vishva-patel187) |
| Andrea Cuevas | [cuevasandrea676-bit](https://github.com/cuevasandrea676-bit) |
| Alaine Krizia | [alainekrizia](https://github.com/alainekrizia) |
| Rabib Islam | [rabib773](https://github.com/rabib773) |
| Jose Pablo Du | [jsepblo](https://github.com/jsepblo) |
---

## Timeline

| Milestone | Week |
|---|---|
| Team formation and GitHub setup | Week 5 |
| PRD finalised and repo structured | Week 6 |
| Embedding pipeline and MCP server | Week 7 |
| Agent orchestration and report generation | Week 8 |
| Final testing, documentation and submission | Week 9 |

---

## Product Requirements
The Digital Twin must be able to:
- Conduct a full professional job interview autonomously using an agentic LLM
- Retrieve real profile data from a vector database using semantic search
- Generate factual, grounded answers based only on retrieved evidence
- Produce a final hiring recommendation report in Markdown format
- Operate entirely inside VS Code Insiders using GitHub Copilot Agent Mode (Option 1)

---

## AI Study / Reference URLs

| Resource | URL |
|---|---|
| Upstash Vector Documentation | https://upstash.com/docs/vector/overall/getstarted |
| Groq API Documentation | https://console.groq.com/docs/openai |
| MCP Protocol Documentation | https://modelcontextprotocol.io/introduction |
| GitHub Copilot Agent Mode | https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode |
| LangChain RAG Guide | https://python.langchain.com/docs/tutorials/rag/ |
| Anthropic Claude Documentation | https://docs.anthropic.com |

---

## Functional Requirements
- The system must perform semantic search over a vector database using MCP tool-calling
- The agentic LLM must autonomously generate interview questions from a job description
- The agent must retrieve relevant profile chunks for each interview question
- The agent must synthesise professional, first-person answers grounded in retrieved data
- The system must generate a Markdown report with full transcript and hire/no-hire recommendation
- The agent must read interview rules and behaviour from `agents.md`
- The system must support multiple job descriptions stored in a `/jobs` folder

---

## Non-Functional Requirements
- No personal embeddings or API keys stored in the GitHub repository
- `.env` files must be used locally for all secrets
- `.gitignore` must prevent sensitive files from being committed
- All team members must have visible commits and pull requests in GitHub
- The repository must be public and accessible to assessors
- The final working version must be on the `main` branch
- Commit messages must be descriptive and attributable to named authors

---

## Acceptance Criteria
- [ ] MCP server successfully connects to Upstash Vector and performs semantic search
- [ ] Agent autonomously generates interview questions from a job description file
- [ ] Agent retrieves relevant profile chunks for each question via MCP tool-call
- [ ] Agent produces complete, grounded answers without manual guidance
- [ ] Final Markdown report includes transcript and justified hire/no-hire recommendation
- [ ] All 7 team members have at least one visible commit in the GitHub repository
- [ ] Repository contains README.md, agents.md, and docs/prd.md
- [ ] No secrets or personal data committed to the repository

---

## Tech Stack

| Component | Technology |
|---|---|
| Vector Database | Upstash Vector (built-in embeddings) |
| LLM Inference | Groq (llama-3.1-8b-instant) |
| Agent Mode | VS Code Insiders + GitHub Copilot (Claude Sonnet 4.5) |
| Tool Calling | MCP (Model Context Protocol) server |
| Language | Python |

---

## Security & Good Practice
- `.env` files used locally for all API keys
- `.gitignore` prevents secrets from being committed
- No personal embeddings or Upstash tokens stored in the repository
- No classmate personal data stored in the shared repo

---

*This PRD was created as part of the Week 5 project kickoff and will be updated 
as the project progresses.*