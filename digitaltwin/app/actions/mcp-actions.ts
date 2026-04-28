"use server";

/**
 * Server actions — wrap shared digital-twin logic for use in Next.js UI and API.
 * Follows the rolldice-mcpserver pattern (app/actions/mcp-actions.ts).
 */

import { readFile } from "fs/promises";
import path from "path";
import { buildChunksFromProfile } from "@/lib/chunker";
import {
  semanticSearch as semanticSearchCore,
  seedDatabase as seedDatabaseCore,
  getDatabaseInfo,
  type SemanticSearchResult,
} from "@/lib/digital-twin";
import { createLogger } from "@/lib/logger";

const log = createLogger("server-action");

// ── Semantic search action ───────────────────────────────────────────────────

export async function semanticSearch(
  query: string
): Promise<{ success: true; result: SemanticSearchResult } | { success: false; error: string }> {
  try {
    const result = await semanticSearchCore(query);
    log.info("semanticSearch succeeded", { query, sources: result.sources.length });
    return { success: true, result };
  } catch (error) {
    log.error("semanticSearch failed", { query, error: error instanceof Error ? error.message : String(error) });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

// ── Seed database action ─────────────────────────────────────────────────────

export async function seedDatabase(): Promise<
  { success: true; count: number } | { success: false; error: string }
> {
  try {
    const reset =
      (process.env.RESET_UPSTASH_INDEX ?? "").trim().toLowerCase() === "true";

    // Read profile JSON from project root
    const jsonPath = path.join(process.cwd(), "digitaltwin.json");
    const raw = await readFile(jsonPath, "utf-8");
    const profileData = JSON.parse(raw);

    // Chunk and upsert
    const chunks = buildChunksFromProfile(profileData);
    if (chunks.length === 0) {
      return { success: false, error: "No content chunks built from profile data" };
    }

    const count = await seedDatabaseCore(chunks, reset);
    log.info("seedDatabase succeeded", { count, reset });
    return { success: true, count };
  } catch (error) {
    log.error("seedDatabase failed", { error: error instanceof Error ? error.message : String(error) });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Seed failed",
    };
  }
}

// ── Database info action ─────────────────────────────────────────────────────

export async function checkDatabase(): Promise<
  { success: true; info: Awaited<ReturnType<typeof getDatabaseInfo>> } | { success: false; error: string }
> {
  try {
    const info = await getDatabaseInfo();
    return { success: true, info };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get database info",
    };
  }
}
