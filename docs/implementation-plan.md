# Implementation Plan — Digital Twin RAG Interview Agent

**Status:** Approved | **Version:** 1.1 | **Last Updated:** April 9, 2026

---

## Executive Summary

This document outlines the implementation roadmap for the Digital Twin RAG Interview Agent system. The plan breaks down work into 5 major phases, tracks dependencies, assigns responsibilities, and provides a checklist for tracking progress.

> **Architecture note:** The agentic LLM (GitHub Copilot in VS Code Agent Mode) is the orchestrator. It reads job descriptions, generates interview questions, calls the MCP `semantic_search` tool, synthesises answers, and produces the final report autonomously. We do **not** build a separate Python orchestrator or report generator — our deliverable is the MCP server, the vector data pipeline, and the agent instructions (`agents.md`).

---

## Phase 1: Foundation & Data Pipeline (Week 5–6)

### 1.1 Environment Setup

- [ ] Create `.env` file from placeholders (used by `python-dotenv` `load_dotenv()`)
  - `GROQ_API_KEY`
  - `UPSTASH_VECTOR_REST_URL`
  - `UPSTASH_VECTOR_REST_TOKEN`
  - `RESET_UPSTASH_INDEX`
- [ ] Verify `.gitignore` excludes `.env*` files (already excludes `.env`)
- [ ] Update existing `README.md` with environment variable documentation (Setup section)
- [ ] Verify all team members can access required APIs

**Dependencies:** None (baseline)
**Estimated Effort:** 2 hours

---

### 1.2 Python Project Structure

- [ ] Create directory structure:
  - `mcp-server/` (MCP tool server)
  - `jobs/` (job description files)
  - `tests/` (unit tests)
  - `.venv/` (Python virtual environment)
- [ ] Initialize `requirements.txt` with dependencies:
  ```
  python-dotenv>=1.0.0
  upstash-vector>=0.5.0
  groq>=0.4.0
  mcp>=1.0.0
  ```
- [ ] Verify virtual environment and install dependencies

**Dependencies:** Section 1.1
**Estimated Effort:** 1 hour

---

### 1.3 Profile Data & Chunking Pipeline

> **Note:** `digitaltwin_rag.py` already implements `build_chunks_from_profile()`, `setup_vector_database()`, `query_vectors()`, and `generate_response_with_groq()`. This task is a **refactor**, not a greenfield build.

- [ ] Refactor existing `digitaltwin_rag.py` into modular, production-grade code
  - Extract `build_chunks_from_profile()` into a standalone module importable by the MCP server
  - Ensure all JSON keys are handled
  - Verify metadata tagging (category, tags) is consistent
- [ ] Create unit tests for chunking logic
- [ ] Validate output on existing `digitaltwin.json` template data
- [ ] Document expected JSON schema in `README.md` (Profile Schema section)

**Dependencies:** Section 1.2
**Estimated Effort:** 4 hours

---

### 1.4 Vector Database Integration

> **Note:** `digitaltwin_rag.py` already implements `setup_vector_database()` (with reset logic) and `query_vectors()`. This task refactors that existing code.

- [ ] Refactor existing Upstash Vector connection logic into a reusable module
  - Initialize Index with REST URL and token from `.env`
  - Handle connection errors gracefully
- [ ] Refactor existing vector upload pipeline
  - Upload chunked profile data with metadata
  - Store embeddings with similarity scores
- [ ] Refactor existing search function (`query_vectors()`) for use by MCP server
  - Query top-k relevant chunks by similarity
  - Return results with metadata (title, content, score, category)
- [ ] Preserve existing RESET_UPSTASH_INDEX logic for database resets
- [ ] Create unit tests for Upstash operations

**Dependencies:** Section 1.3
**Estimated Effort:** 3 hours

---

## Phase 2: MCP Server Development (Week 6–7)

### 2.1 MCP Server Skeleton

> **Library:** Use the Python `mcp` SDK (Model Context Protocol). Follow the same pattern as the [rolldice MCP server reference](https://github.com/gocallum/rolldice-mcpserver.git) specified in `agents.md`.

- [ ] Implement `mcp-server/server.py` using the `mcp` Python SDK
  - Initialize MCP server with tool registry
  - Define `semantic_search` tool schema (input: `query` string + optional `top_k` int, output: array of chunks)
  - Wire tool to the refactored Upstash query function from Phase 1.4
- [ ] Set up tool input validation
- [ ] Add error handling & logging
- [ ] Write integration tests for MCP tool

**Dependencies:** Section 1.4
**Estimated Effort:** 3 hours

---

### 2.2 Semantic Search Tool Integration

- [ ] Verify `semantic_search` MCP tool returns structured results from Upstash
  - Accept `query` parameter (string)
  - Accept optional `top_k` parameter (default 3)
  - Return structured results: title, content, score, category
- [ ] Implement fallback behavior for empty results
- [ ] Create end-to-end test: query → Upstash → output

**Dependencies:** Section 2.1
**Estimated Effort:** 3 hours

---

### 2.3 Local MCP Server Testing

- [ ] Set up local server startup & shutdown scripts
- [ ] Test MCP tool availability from VS Code Agent Mode
- [ ] Verify error handling (missing API keys, connection failures)
- [ ] Document how to run server locally in `README.md` (Local Setup section)

**Dependencies:** Section 2.2
**Estimated Effort:** 2 hours

---

## Phase 3: Agent Configuration (Week 7–8)

### 3.1 Agent Instructions (AGENTS.md)

> **Key insight:** The agentic LLM (GitHub Copilot in Agent Mode) handles all orchestration — question generation, MCP tool calling, answer synthesis, and report generation. We do **not** build a separate Python orchestrator. `AGENTS.md` is the core control surface.

- [ ] Update existing `agents.md` to add interview-specific instructions:
  - Persona definition (digital twin of candidate)
  - Behavior guidelines (autonomy, grounding, accuracy)
  - Constraints (do not make up information, cite evidence)
  - Instructions for reading job descriptions from `jobs/` folder
  - Instructions for calling `semantic_search` MCP tool per question
  - Report format specification (transcript, evidence citations, hire/no-hire recommendation)
  - Example interview structure
  > **Note:** `agents.md` already exists with project setup instructions and reference repos. Extend it rather than replacing it.
- [ ] Review with team for accuracy & tone
- [ ] Version control & document approval

**Dependencies:** None (parallel to Phase 2)
**Estimated Effort:** 3 hours

---

### 3.2 Job Description Templates
**Owner:** Ranne Sanedrin

- [ ] Create `jobs/` directory structure
- [ ] Create sample job description: `jobs/example-role.md`
  - Include role title, responsibilities, required skills, seniority level
- [ ] Provide template for team members to add more jobs

**Dependencies:** Section 1.2
**Estimated Effort:** 1 hour

---

## Phase 4: Validation & Report Testing (Week 8)

> **Note:** The agentic LLM generates the final Markdown report autonomously based on instructions in `AGENTS.md`. There is no separate Python report generator. This phase validates that the end-to-end flow produces correct reports.

### 4.1 End-to-End Interview Validation
**Owner:** Vishva Patel

- [ ] Run a full interview using VS Code Agent Mode with a sample job description
  - Verify the LLM reads the job description from `jobs/`
  - Verify the LLM calls `semantic_search` MCP tool for each question
  - Verify answers are grounded in retrieved profile chunks
- [ ] Verify the LLM generates a Markdown report containing:
  - Candidate details and job title
  - Full interview transcript with evidence citations
  - Hire / no-hire recommendation with justification
- [ ] Test with multiple job descriptions
- [ ] Verify Markdown renders correctly in GitHub UI
- [ ] Create sample report for documentation

**Dependencies:** Sections 2.3 & 3.1
**Estimated Effort:** 3 hours

---

## Phase 5: Testing, Documentation & Handoff (Week 9)

### 5.1 Integration Testing
**Owner:** Rabib Islam

- [ ] Verify full pipeline: profile data → Upstash vectors → MCP search → LLM interview → report
- [ ] Validate:
  - MCP tool availability from VS Code Agent Mode
  - Semantic search accuracy (relevant chunks returned)
  - Report completeness (transcript, citations, recommendation)
  - No secrets leaked in output
- [ ] Test error recovery (network failures, missing API keys, API timeouts)
- [ ] Test database reset logic (RESET_UPSTASH_INDEX flag)
- [ ] Document test procedure in `README.md` (Testing section)

**Dependencies:** Section 4.1
**Estimated Effort:** 4 hours

---

### 5.2 Documentation & Cleanup
**Owner:** Remi Strachan + All

- [ ] Update `README.md` with consolidated documentation:
  - Architecture overview
  - Environment setup guide (API keys, `.env` file)
  - Profile JSON schema reference
  - Local MCP server startup instructions
  - Troubleshooting section
- [ ] Remove temporary files and debug code
- [ ] Code review across all modules
- [ ] Verify `.gitignore` excludes all sensitive files

**Dependencies:** Section 5.1
**Estimated Effort:** 3 hours

---

### 5.3 Team Sign-Off & Handoff
**Owner:** Ranne Sanedrin

- [ ] Conduct team review of entire system
- [ ] Verify all PRD requirements met
- [ ] Verify all 7 team members have visible commits on `main`
- [ ] Confirm repository is public and accessible to assessors
- [ ] Final merge to `main` branch

**Dependencies:** Section 5.2
**Estimated Effort:** 2 hours

---

## Dependency Graph

```
Phase 1 (Week 5–6)
├── 1.1 (Environment Setup)
├── 1.2 (Project Structure) → depends on 1.1
├── 1.3 (Chunking Pipeline — refactor existing) → depends on 1.2
└── 1.4 (Vector DB — refactor existing) → depends on 1.3

Phase 2 (Week 6–7)
├── 2.1 (MCP Server — mcp SDK) → depends on 1.4
├── 2.2 (Search Tool Integration) → depends on 2.1
└── 2.3 (Local Testing) → depends on 2.2

Phase 3 (Week 7–8) [parallel to Phase 2]
├── 3.1 (AGENTS.md — controls LLM orchestration)
└── 3.2 (Job Descriptions) → depends on 1.2

Phase 4 (Week 8)
└── 4.1 (E2E Interview Validation) → depends on 2.3 & 3.1

Phase 5 (Week 9)
├── 5.1 (Integration Testing) → depends on 4.1
├── 5.2 (Documentation) → depends on 5.1
└── 5.3 (Sign-Off) → depends on 5.2
```

---

## Team Ownership Matrix

| Component | Owner | Backup |
|---|---|---|
| 1.1 Environment Setup | Remi Strachan | Ranne Sanedrin |
| 1.2 Python Structure | Ranne Sanedrin | Remi Strachan |
| 1.3 Chunking Pipeline (refactor) | Vishva Patel | Andrea Cuevas |
| 1.4 Vector DB (refactor) | Andrea Cuevas | Vishva Patel |
| 2.1 MCP Server | Alaine Krizia | Rabib Islam |
| 2.2 Search Tool Integration | Alaine Krizia + Andrea Cuevas | – |
| 2.3 Local Testing | Rabib Islam | Alaine Krizia |
| 3.1 agents.md Instructions | Jose Pablo Du | Ranne Sanedrin |
| 3.2 Job Descriptions | Ranne Sanedrin | Jose Pablo Du |
| 4.1 E2E Interview Validation | Vishva Patel | Rabib Islam |
| 5.1 Integration Testing | Rabib Islam | Remi Strachan |
| 5.2 Documentation | Remi Strachan + All | – |
| 5.3 Sign-Off | Ranne Sanedrin | Remi Strachan |

---

## Success Criteria

### ✅ Code Quality
- [ ] All code passes linting (PEP 8)
- [ ] Unit test coverage ≥ 80%
- [ ] All error cases handled gracefully
- [ ] No hardcoded secrets or API keys

### ✅ Functionality
- [ ] MCP server exposes `semantic_search` tool
- [ ] Agentic LLM (Copilot Agent Mode) generates contextually relevant questions
- [ ] Answers grounded in retrieved profile data
- [ ] Final report includes hire/no-hire recommendation with evidence
- [ ] All 7 team members have visible commits on `main` branch

### ✅ Documentation
- [ ] `README.md` enables new team member onboarding in < 30 minutes
- [ ] MCP tool contract (input/output) documented in README
- [ ] Troubleshooting guide covers common issues
- [ ] Code comments explain non-obvious logic

### ✅ Deployment
- [ ] `.env` file properly excluded from version control
- [ ] Upstash Vector setup documented
- [ ] Groq API integration verified
- [ ] Local MCP server startup verified
- [ ] Repository is public and accessible to assessors
- [ ] Final working version is on `main` branch

---

## Git & Collaboration Workflow

- **Repository must be public** and accessible to assessors at all times
- **Branching strategy:** Feature branches per task → Pull Request → merge to `main`
  - Branch naming: `<github-username>/<feature-name>` (e.g., `rstra33/setup`)
- **Commit messages:** Descriptive and attributable to named authors
- **Minimum contribution:** Every team member must have at least one visible commit on `main`
- **Final submission:** The working version must be on the `main` branch
- **Code review:** All PRs require at least one approving review before merge

---

## Timeline Summary

| Phase | PRD Week | Effort (hours) | Status |
|---|---|---|---|
| Phase 1: Foundation & Data Pipeline | Weeks 5–6 | ~9 | Not Started |
| Phase 2: MCP Server | Weeks 6–7 | ~7 | Not Started |
| Phase 3: Agent Configuration | Weeks 7–8 | ~4 | Not Started |
| Phase 4: Validation & Report Testing | Week 8 | ~3 | Not Started |
| Phase 5: Testing, Docs & Handoff | Week 9 | ~9 | Not Started |
| **Total** | **Weeks 5–9** | **~32 hours** | **Not Started** |

---

## Approval & Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| Product Lead | [ Name ] | [ Date ] | [ ] |
| Tech Lead | [ Name ] | [ Date ] | [ ] |
| Backend Lead | [ Name ] | [ Date ] | [ ] |
| Team 2 Representative | [ Name ] | [ Date ] | [ ] |

---

## Version History

| Version | Author | Date | Changes |
|---|---|---|---|
| 1.0 | AI-Generated | Apr 9, 2026 | Initial implementation plan from design.md |
| 1.1 | AI-Revised | Apr 9, 2026 | Fixed PRD alignment: removed Python orchestrator/report generator (LLM handles via AGENTS.md), scoped Phase 1.3/1.4 as refactors, added MCP SDK dependency, mapped roles to team members, added git workflow section, aligned timeline to PRD Weeks 5–9, consolidated documentation into README.md, reconciled JSON schema keys |

---

## Appendix: Key Files & Locations

| File | Purpose |
|---|---|
| `digitaltwin.json` | Source profile data — template already exists (each member populates their own) |
| `digitaltwin_rag.py` | Existing RAG pipeline (to refactor into modules) |
| `mcp-server/server.py` | MCP tool server using `mcp` SDK (new) |
| `agents.md` | Agent behavior instructions — already exists, to be extended with interview logic |
| `jobs/example-role.md` | Sample job description (new) |
| `.env` | Environment variables — create locally, not in git |
| `.gitignore` | Already exists, already excludes `.env` |
| `docs/prd.md` | Product Requirements Document |
| `docs/design.md` | Technical Design Document |
| `docs/implementation-plan.md` | This document |

---

*This implementation plan was derived from `docs/design.md` and `docs/prd.md`, then revised to align with the architecture where the agentic LLM (Copilot Agent Mode) handles orchestration, answer synthesis, and report generation. The MCP server, vector pipeline, and `agents.md` are the core deliverables.*
