# Presentation Outline — Slide 8 & Slide 11

---

## Slide 8 — System Architecture
**Presenter:** Remi | **Duration:** 1 minute

- Two access points: VS Code in agent mode, or Claude Desktop — both connect to the same system
- When an interview simulation starts, Claude Sonnet acts as the outer agent
  - Reads the job description, analyses required skills and experience, and decides what questions to ask
- For each question, Claude calls the MCP tool — the core of the system
  - The tool sends the question to Upstash Vector, our vector database
  - Upstash has a built-in embedding model: converts the query into an embedding and runs a semantic similarity search across all stored profile data
  - Returns the top 3 most relevant chunks (e.g. if asked about leadership, it pulls the most closely related chunks)
- Those results are passed to Groq, running LLaMA 3.1
  - Groq synthesises the raw chunks into a natural, first-person answer — sounds like you're actually answering in conversation, not returning database bullet points
- The answer is passed back to Claude
- Once all questions are done, Claude compiles a final structured report with scores and analysis
- Underpinning the whole system: profile data preparation
  - Experience, skills, and achievements structured into JSON, chunked into sections, and upserted into Upstash via a Python script in VS Code
  - This is the foundation the entire system searches against

---

## Slide 11 — Improvements
**Presenter:** Remi | **Duration:** 1 minute

**Improvement 1 — From simple RAG pipeline to MCP server**
- Started with a basic RAG pipeline: runs locally, triggered manually, can only answer one-off queries
- By wrapping this in an MCP server, we turned it into a callable tool for an agent
  - Enables full interview simulation, not just isolated queries
  - Usable by any compatible MCP client (VS Code agent mode, Claude Desktop, etc.)

**Improvement 2 — Hallucination fix**
- Groq was fabricating experiences not present in the profile (e.g. invented a Tableau story)
- Root cause — the hallucination chain:
  - Claude calls `semantic_search` → Groq retrieves context and generates answer → Claude outputs it verbatim
  - If retrieved chunks don't contain a matching example, Groq fills the gap with a plausible-sounding fabrication
- Fix applied in `lib/digital-twin.ts`:
  - Added grounding instruction to the Groq system prompt: only use facts from retrieved context
  - Added `STRICT RULE` to the RAG user prompt directly next to injected context: admit gaps, never invent
  - Lowered temperature from 0.7 → 0.5 to reduce creative generation while keeping responses conversational