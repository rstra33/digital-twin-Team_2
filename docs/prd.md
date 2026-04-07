# Product Requirements Document — Digital Twin RAG Interview Agent
Built as part of the AusBiz Consulting Digital Twin project (Team 2).

---

## Project Overview
This project delivers an AI-powered Digital Twin that conducts professional job interviews on behalf of a candidate. The system uses Retrieval-Augmented Generation (RAG) to retrieve real profile data from a vector database and generate factual, grounded interview responses — never hallucinating or inventing information.

---

## Team Members

| Name | GitHub |
|---|---|
| Ranne Sanedrin | impulsifier |
| Remi Strachan | rstra33 |
| Vishva Patel | vishva-patel187 |
| Andrea Cuevas | cuevasandrea676-bit |
| Alaine Krizia | alainekrizia |
| Rabib Islam | rabib773 |
| Jose Pablo Du | jsepblo |

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

## Goals
Embed — Structured profile JSON is chunked, embedded, and stored in Upstash Vector.
Retrieve — MCP server performs semantic search to find the most relevant profile chunks.
Generate — The LLM analyses retrieved evidence and produces accurate, first-person answers.
Report — A Markdown hiring recommendation report is generated after each full interview.

## Non-Goals
- No web-based UI (Option 1 — VS Code Agent Mode only)
- No real employer data or live job postings
- No sensitive personal data stored in the repository

---

## Success Criteria
- [ ] MCP server successfully performs semantic search on Upstash Vector
- [ ] Agent autonomously generates interview questions from a job description
- [ ] Agent retrieves relevant profile chunks for each question
- [ ] Final report includes full transcript and hire/no-hire recommendation
- [ ] All 7 team members have visible commits and pull requests in GitHub

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

*This PRD was created as part of the Week 5 project kickoff and will be updated as the project progresses.*