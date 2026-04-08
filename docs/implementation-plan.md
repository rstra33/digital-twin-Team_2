# Implementation Plan — Digital Twin RAG Interview Agent

**Status:** Approved | **Version:** 1.0 | **Last Updated:** April 9, 2026

---

## Executive Summary

This document outlines the implementation roadmap for the Digital Twin RAG Interview Agent system. The plan breaks down work into 5 major phases, tracks dependencies, assigns responsibilities, and provides a checklist for tracking progress.

---

## Phase 1: Foundation & Data Pipeline (Week 1)

### 1.1 Environment Setup
**Owner:** DevOps / Tech Lead

- [ ] Create `.env.local` file with placeholders
  - `GROQ_API_KEY`
  - `UPSTASH_VECTOR_REST_URL`
  - `UPSTASH_VECTOR_REST_TOKEN`
  - `RESET_UPSTASH_INDEX`
- [ ] Update `.gitignore` to exclude `.env*` files
- [ ] Document environment variables in `docs/SETUP.md`
- [ ] Verify all team members can access required APIs

**Dependencies:** None (baseline)
**Estimated Effort:** 2 hours

---

### 1.2 Python Project Structure
**Owner:** Backend Lead

- [ ] Create directory structure:
  - `mcp-server/` (MCP tool server)
  - `agent/` (orchestration & reporting)
  - `tests/` (unit tests)
  - `.venv/` (Python virtual environment)
- [ ] Initialize `requirements.txt` with dependencies:
  ```
  python-dotenv>=1.0.0
  upstash-vector>=0.5.0
  groq>=0.4.0
  ```
- [ ] Verify virtual environment and install dependencies

**Dependencies:** Section 1.1
**Estimated Effort:** 1 hour

---

### 1.3 Profile Data & Chunking Pipeline
**Owner:** Data Engineer

- [ ] Refactor `digitaltwin_rag.py` into production-grade code
  - Implement `build_chunks_from_profile()` function
  - Split profile into semantic chunks: experience, skills, education, projects, goals
  - Add metadata tagging (category, date range, confidence)
- [ ] Create unit tests for chunking logic
- [ ] Validate output on `digitaltwin.json` sample data
- [ ] Document expected schema in `docs/PROFILE_SCHEMA.md`

**Dependencies:** Section 1.2
**Estimated Effort:** 4 hours

---

### 1.4 Vector Database Integration
**Owner:** Data Engineer

- [ ] Implement Upstash Vector connection logic
  - Initialize Index with REST URL and token
  - Handle connection errors gracefully
- [ ] Implement vector upload pipeline
  - Upload chunked profile data with metadata
  - Store embeddings with similarity scores
- [ ] Implement search function (`semantic_search_upstash()`)
  - Query top-k relevant chunks by similarity
  - Return results with metadata
- [ ] Add RESET_UPSTASH_INDEX logic for database resets
- [ ] Create unit tests for Upstash operations

**Dependencies:** Section 1.3
**Estimated Effort:** 5 hours

---

## Phase 2: MCP Server Development (Week 1–2)

### 2.1 MCP Server Skeleton
**Owner:** Backend Lead

- [ ] Implement `mcp-server/server.py` with MCP protocol compliance
  - Initialize MCP server with tool registry
  - Define `semantic_search` tool schema (input, output, description)
- [ ] Set up tool input validation
- [ ] Add error handling & logging
- [ ] Write integration tests for MCP tool

**Dependencies:** Section 1.4
**Estimated Effort:** 3 hours

---

### 2.2 Semantic Search Tool Integration
**Owner:** Backend Lead + Data Engineer

- [ ] Wire `semantic_search` MCP tool to Upstash backend
  - Accept `query` parameter (string)
  - Accept optional `top_k` parameter (default 3)
  - Return structured results: title, content, score, category
- [ ] Add query preprocessing (normalization, tokenization)
- [ ] Implement fallback behavior for empty results
- [ ] Create end-to-end test: query → Upstash → output

**Dependencies:** Section 2.1
**Estimated Effort:** 3 hours

---

### 2.3 Local MCP Server Testing
**Owner:** QA / Backend Lead

- [ ] Set up local server startup & shutdown scripts
- [ ] Test MCP tool availability in test harness
- [ ] Verify error handling (missing API keys, connection failures)
- [ ] Document how to run server locally in `docs/LOCAL_SETUP.md`

**Dependencies:** Section 2.2
**Estimated Effort:** 2 hours

---

## Phase 3: Agent Orchestration (Week 2–3)

### 3.1 Agent Instructions (AGENTS.md)
**Owner:** Product Lead / AI Specialist

- [ ] Create `AGENTS.md` with:
  - Persona definition (digital twin of candidate)
  - System prompt template
  - Behavior guidelines (autonomy, grounding, accuracy)
  - Constraints (do not make up information, cite evidence)
  - Example interview structure
- [ ] Review with team for accuracy & tone
- [ ] Version control & document approval

**Dependencies:** None (parallel to 3.2)
**Estimated Effort:** 2 hours

---

### 3.2 Interview Orchestration Logic
**Owner:** AI Specialist

- [ ] Implement `agent/interviewer.py` with:
  - Job description loader (reads `.md` from `jobs/` folder)
  - Question generator (LLM-based, reads job description + AGENTS.md)
  - MCP tool caller (invokes semantic_search for each question)
  - Answer synthesizer (LLM-based, combines retrieved chunks into first-person response)
  - Evaluation logic (rates candidate fit based on job match)
- [ ] Implement loop: generate question → search → synthesize answer → evaluate
- [ ] Add conversation memory (track Q&A pairs)
- [ ] Error handling for Groq API failures
- [ ] Unit tests for orchestration logic

**Dependencies:** Sections 2.3 & 3.1
**Estimated Effort:** 6 hours

---

### 3.3 Job Description Templates
**Owner:** Product Lead

- [ ] Create `jobs/` directory structure
- [ ] Create sample job description: `jobs/example-role.md`
  - Include role title, responsibilities, required skills, seniority level
- [ ] Document job description schema in `docs/JOB_SCHEMA.md`
- [ ] Provide template for team members to add more jobs

**Dependencies:** Section 1.2
**Estimated Effort:** 1 hour

---

## Phase 4: Report Generation (Week 3)

### 4.1 Report Generator Implementation
**Owner:** Backend Lead

- [ ] Implement `agent/report_generator.py` with:
  - Candidate information formatter
  - Interview transcript builder (Q&A pairs with timestamps)
  - Evidence citation engine (links each answer to retrieved chunks)
  - Hiring recommendation logic (pass/fail based on evaluation scores)
  - Markdown report templating
- [ ] Generate structured report with:
  - Header (candidate, job, date, interviewer)
  - Full transcript with citations
  - Per-question evidence breakdown
  - Hiring recommendation with justification
  - Confidence scores
- [ ] Test report generation with sample data

**Dependencies:** Section 3.2
**Estimated Effort:** 4 hours

---

### 4.2 Report Output Validation
**Owner:** QA / Product Lead

- [ ] Verify Markdown format renders correctly in GitHub UI
- [ ] Test report with multiple job descriptions
- [ ] Validate all citations reference actual chunks
- [ ] Check recommendation logic accuracy
- [ ] Create sample report for documentation

**Dependencies:** Section 4.1
**Estimated Effort:** 2 hours

---

## Phase 5: Testing & Deployment (Week 4)

### 5.1 End-to-End Integration Test
**Owner:** QA / Tech Lead

- [ ] Set up integration test harness
  - Load sample profile (`digitaltwin.json`)
  - Upload vectors to test Upstash index
  - Start MCP server
  - Run full interview flow: question generation → search → answer synthesis → report
- [ ] Validate:
  - MCP tool availability
  - Semantic search accuracy
  - Report generation completeness
  - No secrets leaked in output
- [ ] Document test procedure in `docs/TESTING.md`

**Dependencies:** Sections 4.2, 2.3
**Estimated Effort:** 3 hours

---

### 5.2 Performance & Reliability Testing
**Owner:** QA

- [ ] Load test MCP server (concurrent requests)
- [ ] Test error recovery (network failures, API timeouts)
- [ ] Measure semantic search latency
- [ ] Validate Groq API rate limits
- [ ] Test database reset logic (RESET_UPSTASH_INDEX flag)

**Dependencies:** Section 5.1
**Estimated Effort:** 3 hours

---

### 5.3 Documentation & Cleanup
**Owner:** Tech Lead / All

- [ ] Write comprehensive README in `docs/README.md`
  - Architecture overview
  - Quick start guide
  - Troubleshooting section
- [ ] Document API contracts in `docs/API_CONTRACTS.md`
- [ ] Create deployment guide for Upstash + Groq setup
- [ ] Remove temporary files and debug code
- [ ] Code review across all modules

**Dependencies:** Section 5.1
**Estimated Effort:** 4 hours

---

### 5.4 Team Sign-Off & Handoff
**Owner:** Product Lead

- [ ] Conduct team review of entire system
- [ ] Verify all requirements met (PRD → design → implementation)
- [ ] Sign off on code quality & documentation
- [ ] Assign ownership for ongoing maintenance
- [ ] Plan post-launch monitoring

**Dependencies:** Section 5.3
**Estimated Effort:** 2 hours

---

## Dependency Graph

```
Phase 1
├── 1.1 (Environment Setup)
├── 1.2 (Project Structure) → depends on 1.1
├── 1.3 (Chunking Pipeline) → depends on 1.2
└── 1.4 (Vector DB) → depends on 1.3

Phase 2
├── 2.1 (MCP Server) → depends on 1.4
├── 2.2 (Search Tool) → depends on 2.1
└── 2.3 (Local Testing) → depends on 2.2

Phase 3
├── 3.1 (AGENTS.md) [parallel]
├── 3.2 (Orchestration) → depends on 2.3 & 3.1
└── 3.3 (Job Descriptions) → depends on 1.2

Phase 4
├── 4.1 (Report Generator) → depends on 3.2
└── 4.2 (Output Validation) → depends on 4.1

Phase 5
├── 5.1 (Integration Test) → depends on 4.2 & 2.3
├── 5.2 (Perf Testing) → depends on 5.1
├── 5.3 (Documentation) → depends on 5.1
└── 5.4 (Sign-Off) → depends on 5.3
```

---

## Team Ownership Matrix

| Component | Owner | Backup |
|---|---|---|
| Environment Setup | DevOps / Tech Lead | Backend Lead |
| Python Structure | Backend Lead | Tech Lead |
| Chunking Pipeline | Data Engineer | Backend Lead |
| Vector DB Integration | Data Engineer | Backend Lead |
| MCP Server | Backend Lead | AI Specialist |
| Semantic Search Tool | Backend Lead + Data Engineer | – |
| Local Testing | QA / Backend Lead | Tech Lead |
| AGENTS.md Instructions | Product Lead / AI Specialist | – |
| Interview Orchestration | AI Specialist | Backend Lead |
| Job Descriptions | Product Lead | – |
| Report Generator | Backend Lead | AI Specialist |
| Report Validation | QA / Product Lead | – |
| E2E Testing | QA / Tech Lead | – |
| Performance Testing | QA | – |
| Documentation | Tech Lead + All | – |
| Sign-Off | Product Lead | Tech Lead |

---

## Success Criteria

### ✅ Code Quality
- [ ] All code passes linting (PEP 8)
- [ ] Unit test coverage ≥ 80%
- [ ] All error cases handled gracefully
- [ ] No hardcoded secrets or API keys

### ✅ Functionality
- [ ] MCP server exposes `semantic_search` tool
- [ ] Agent generates contextually relevant questions
- [ ] Answers grounded in retrieved profile data
- [ ] Final report includes hire/no-hire recommendation with evidence
- [ ] All team members have visible commits

### ✅ Documentation
- [ ] Setup guide enables new team member onboarding in < 30 minutes
- [ ] API contracts clearly documented
- [ ] Troubleshooting guide covers common issues
- [ ] Code comments explain non-obvious logic

### ✅ Deployment
- [ ] `.env` file properly excluded from version control
- [ ] Upstash Vector setup documented
- [ ] Groq API integration verified
- [ ] Local MCP server startup verified

---

## Timeline Summary

| Phase | Duration | Effort (hours) | Status |
|---|---|---|---|
| Phase 1: Foundation | Week 1 | ~12 | Not Started |
| Phase 2: MCP Server | Weeks 1–2 | ~8 | Not Started |
| Phase 3: Orchestration | Weeks 2–3 | ~9 | Not Started |
| Phase 4: Reporting | Week 3 | ~6 | Not Started |
| Phase 5: Testing & Handoff | Week 4 | ~14 | Not Started |
| **Total** | **4 weeks** | **~49 hours** | **Not Started** |

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

---

## Appendix: Key Files & Locations

| File | Purpose |
|---|---|
| `digitaltwin.json` | Source profile data |
| `digitaltwin_rag.py` | Existing RAG pipeline (to refactor) |
| `mcp-server/server.py` | MCP tool server (new) |
| `agent/interviewer.py` | Interview orchestration logic (new) |
| `agent/report_generator.py` | Report generation (new) |
| `AGENTS.md` | Agent behavior instructions (new) |
| `jobs/example-role.md` | Sample job description (new) |
| `.env.local` | Environment variables (local, not in git) |
| `docs/implementation-plan.md` | This document |

---

*This implementation plan was derived from `docs/design.md` and approved by Team 2. It serves as the single source of truth for task breakdown, dependencies, and ownership throughout development.*
