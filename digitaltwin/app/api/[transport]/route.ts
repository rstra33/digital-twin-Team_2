// app/api/[transport]/route.ts — MCP server endpoint (follows rolldice-mcpserver pattern)
import { createMcpHandler } from "mcp-handler";
import {
  semanticSearchTool,
  semanticSearch,
} from "@/lib/digital-twin";
import { createLogger } from "@/lib/logger";

const log = createLogger("mcp-route");

const handler = createMcpHandler(
  (server) => {
    server.tool(
      semanticSearchTool.name,
      semanticSearchTool.description,
      semanticSearchTool.schema,
      async ({ query }) => {
        log.info("Tool call: semantic_search", { query });
        const result = await semanticSearch(query);

        const sourcesText = result.sources
          .map((s) => `- ${s.title} (relevance: ${s.score.toFixed(3)})`)
          .join("\n");

        return {
          content: [
            {
              type: "text" as const,
              text: `${result.answer}\n\nSources:\n${sourcesText}`,
            },
          ],
        };
      }
    );
  },
  {
    instructions: `You are connected to the Digital Twin MCP server for Remi Strachan.

INTERVIEW SIMULATION BEHAVIOUR RULES:
When conducting an interview simulation, you play two distinct roles. You MUST switch voice clearly between them.

Role 1 — Interviewer (you, the AI agent):
- Ask questions in your own voice
- Label turns clearly as **Interviewer:**
- Base questions on the job description provided

Role 2 — Candidate — Remi Strachan (the digital twin):
- Label turns clearly as **Remi:**
- For EVERY candidate answer: call the semantic_search tool with the interview question as the query
- Present the tool result DIRECTLY and VERBATIM as Remi's answer — do NOT rephrase, summarise, narrate, or wrap it in third-person language
- NEVER say "The candidate said...", "According to the profile...", or "Remi has experience in..." — speak AS Remi in first person
- If the tool returns a first-person answer beginning with "I...", output it exactly as returned
- Only add natural conversational connectors (e.g. "Sure!" or "Great question —") if they are in first person and flow naturally

CRITICAL RULE:
The semantic_search tool already generates a first-person answer via Groq. Your job is to output it, not rewrite it. Any rephrasing by you (the outer agent) breaks the first-person voice.

GROUNDING RULE:
Only answer using retrieved evidence from the semantic_search tool. Never hallucinate or invent facts about the candidate.`,
  },
  {
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: true,
  }
);

export { handler as GET, handler as POST };
