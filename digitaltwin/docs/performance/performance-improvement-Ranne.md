# Performance Improvement Evidence — Ranne Sanedrin
**Digital Twin RAG Interview Agent | Week 3 → Week 4**
**Team 2 | AusBiz Consulting Digital Twin Project**

---

## Issues Identified in Week 3

1. **MCP server not publicly accessible** — only ran on `localhost:3000`, required `pnpm dev` to be running at all times
2. **Missing `/api/mcp` endpoint** — returned 404, no proper MCP route existed in the repo
3. **Missing lib files** — `digitaltwin/lib/` folder was blocked by `.gitignore` (`Lib/` entry), preventing deployment
4. **Template profile data** — `digitaltwin.json` contained placeholder data instead of real personal profile
5. **Limited vectors** — only 11 vectors uploaded from template data
6. **No Claude Desktop integration** — MCP server not connected to Claude Desktop
7. **Single MCP config** — `.vscode/mcp.json` only pointed to localhost with no production fallback

---

## Data Refinement Actions (Week 4)

### MCP Server Improvements
- Created `app/api/mcp/route.ts` with proper JSON-RPC 2.0 MCP endpoint
- Added `lib/` files (`chunker.ts`, `digital-twin.ts`, `logger.ts`) to GitHub repo
- Fixed root `.gitignore` to remove `Lib/` entry that was blocking `digitaltwin/lib/`
- Deployed MCP server to Vercel at `https://digital-twin-team-2.vercel.app`
- Configured `mcp-handler` for proper MCP protocol compliance

### Profile Data Improvements
- Updated `digitaltwin.json` with real personal profile data including:
  - Actual work experience (Kitchen Steward, Sales Marketing Intern, Music Marketing Executive)
  - Real education history (Asia Pacific International College — Master of IT)
  - Actual skills (Python, SQL, Network Security, AI/ML)
  - Personal career goals and interview preparation data
- Re-uploaded **16 vectors** to Upstash `digital-twin-ranne` database
- Verified semantic search returning relevant chunks with relevance scores 0.82+

### Integration Improvements
- Connected Claude Desktop via `npx mcp-remote` to production Vercel URL
- Updated `.vscode/mcp.json` with both local and production server options
- Verified end-to-end pipeline working through Claude Desktop

---

## Before vs After Comparison

| Metric | Week 3 | Week 4 |
|---|---|---|
| MCP server availability | Local only (localhost:3000) | 24/7 via Vercel |
| MCP endpoint `/api/mcp` | 404 Not Found | Live and connected |
| Profile data | Template placeholder | Real personal data |
| Vector count | 11 (template) | 16 (personal) |
| Claude Desktop | Not connected | Connected via mcp-remote |
| VS Code Agent Mode | Local only | Production URL |
| Deployment | None | Live on Vercel |
| Interview accuracy | Generic template responses | Personalized responses |

---

## Interview Performance Comparison

### Week 3 Interview Result
- MCP server only worked via VS Code Agent Mode reading local workspace files
- Responses based on template placeholder profile (Emily Chen / Senior Software Engineer)
- No production deployment
- No Claude Desktop integration

### Week 4 Interview Result
- Production MCP server live at `https://digital-twin-team-2.vercel.app/api/mcp`
- Claude Desktop successfully connected via `mcp-remote`
- Responses based on real personal profile data
- Semantic search returning accurate chunks with relevance scores 0.82+
- Example response correctly identified real work experience and career goals

---

## Target Performance Achieved

✅ MCP server deployed and publicly accessible on Vercel  
✅ Claude Desktop connected to production MCP server via mcp-remote  
✅ Real personal profile data correctly embedded in Upstash Vector (16 vectors)  
✅ Semantic search returning accurate, personalized responses  
✅ VS Code Agent Mode working with production URL  
✅ End-to-end pipeline validated through multiple test queries  
✅ Both local and production MCP servers configured in `.vscode/mcp.json`  

---

*Performance improvement documented as part of Week 4 submission.*  
*Digital Twin RAG Interview Agent — Team 2 | AusBiz Consulting*  
*Date: 28 April 2026*