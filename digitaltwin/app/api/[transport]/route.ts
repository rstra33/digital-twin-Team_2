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
    // Server options
  },
  {
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: true,
  }
);

export { handler as GET, handler as POST };
