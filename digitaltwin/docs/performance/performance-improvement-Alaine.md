# Performance Improvement Evidence — Alaine
**Digital Twin RAG Interview Agent | Week 3 → Week 4**
**Team 2 | AusBiz Consulting Digital Twin Project**

---

## Issues Identified in Week 3

1. **Branch divergence** — PR submitted from an old branch with outdated file structure before `digitaltwin/` migration
2. **Job descriptions in wrong location** — job files not placed in correct `digitaltwin/jobs/` folder
3. **Profile lacked career transition narrative** — `digitaltwin.json` missing bridge between marketing background and tech industry
4. **Merge conflicts** — unable to cleanly merge branch into main due to structural differences
5. **MCP test results not personalised** — responses shows a generic profile rather than a marketing and sustainability expertise found in the initial profile data
6. **Complications with the Vectors** - Upstash database is not being used properly in the interview testing, reflecting a different profile from the database

---

## Data Refinement Actions (Week 4)

### Repository Improvements
- Resolved branch divergence by resetting to latest main
- Moved job description files to correct `digitaltwin/jobs/` location
- Typed the job description files in a standard template of company information, job details, and selection criteria
- Successfully merged branch into main via clean PR

### Profile Data Improvements
- Enhanced `digitaltwin.json` with detailed thesis project (Edible Cups business plan) in STAR format
- Added digital marketing skills with specific tools — SEO/SEM, content creation, graphic design, video production
- Strengthened sustainability and food industry expertise sections
- Added career transition narrative bridging marketing background to data analytics
- Included Advanced Excel and Google Sheets proficiency with quantified examples
- Reinforced the Upstash database with updated `digitaltwin.json` file 

### MCP Integration Improvements
- Connected personal Upstash database to production MCP server
- Re-embedded updated profile vectors with improved chunk structure
- Verified semantic search correctly retrieving marketing and sustainability expertise
- Connected Claude Desktop via `npx mcp-remote` for natural interview practice

---

## Before vs After Comparison

| Metric | Week 3 | Week 4 |
|---|---|---|
| Branch status | Diverged from main | Synced with main |
| Job files location | Wrong folder | Correct `digitaltwin/jobs/` |
| Profile depth | Basic marketing skills | Full STAR format thesis project |
| Career transition narrative | Missing | Added and embedded |
| Technical skills relevance | 0.819 avg | 0.854 avg |
| Claude Desktop | Not connected | Connected via mcp-remote |

---

## Interview Performance Comparison

### Week 3 Interview Result
- Semantic search returning professional values and work style chunks
- Thesis project retrieved but lacking STAR format detail
- Career transition from marketing to data analytics not clearly articulated

### Week 4 Interview Result
- Semantic search correctly retrieving Edible Cups thesis project with business plan details
- Digital marketing skills returning with specific tool proficiency
- Career transition narrative clearly articulated in interview responses
- Claude Desktop providing natural conversational practice for marketing roles

---

## Target Performance Achieved

✅ Branch divergence resolved and synced with main  
✅ Job description files in correct repository location  
✅ Profile enhanced with STAR format thesis project details  
✅ Career transition narrative added and embedded  
✅ Semantic search relevance improved to 0.85+  
✅ Claude Desktop connected to production MCP server  

---

*Performance improvement documented as part of Week 4 submission.*  
*Digital Twin RAG Interview Agent — Team 2 | AusBiz Consulting*  
*Date: 28 April 2026*