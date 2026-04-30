# Presentation Outline — Slide 7 & Slide 11

---

## Slide 7 — Data Preparation
**Presenter:** Ranne | **Duration:** 1 minute

- Each team member has a local JSON file with their professional profile
- Python script chunks the JSON into sections
- Each chunk is enriched with metadata: id, title, type, content, tags
- Chunks are upserted directly to Upstash Vector
- No embedding in Python — Upstash handles it automatically (bge-large-en-v1.5)
- Result: 17 chunks stored and ready for semantic retrieval

---

## Slide 11 — Challenges Faced
**Presenter:** Ranne | **Duration:** 1 minute

**Technical**
- Upstash setup per member — individual DBs, multi-round onboarding
- LLM hallucinations — Groq invents facts; fixed in digitaltwin.ts
- Multi-LLM voice issue — third-person output; fixed in route.ts
- MCP tool integration — agent mode, cross-OS troubleshooting

**Non-Technical**
- Switched from GitHub Copilot to Claude Code — subscription limit reached
- GitHub Copilot plan changes affected team access mid-project
- ~3 members without Copilot — education benefit requires 3-day waiting period
- Incomplete pull requests caused repo inconsistencies
- ClickUp free tier limited custom fields for task tracking
- Vercel Pro required for multi-member collaborative deployment
