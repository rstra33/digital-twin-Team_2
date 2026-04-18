/**
 * Digital Twin core logic — shared by MCP handler and server actions.
 * Implements vector search (Upstash), LLM generation (Groq), and database seeding.
 * Search logic matches digitaltwin_rag.py exactly.
 */

import { Index } from "@upstash/vector";
import Groq from "groq-sdk";
import { z } from "zod";
import { type ProfileChunk } from "./chunker";
import { createLogger } from "./logger";

const log = createLogger("digital-twin");

// ── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_MODEL = "llama-3.1-8b-instant";
const TOP_K = 3;

// ── Clients (lazy singletons) ────────────────────────────────────────────────

let _vectorIndex: Index | null = null;
function getVectorIndex(): Index {
  if (!_vectorIndex) {
    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
    if (!url || !token) {
      throw new Error(
        "Missing Upstash Vector credentials. Set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN in .env"
      );
    }
    _vectorIndex = new Index({ url, token });
    log.info("Upstash Vector client initialized");
  }
  return _vectorIndex;
}

let _groqClient: Groq | null = null;
function getGroqClient(): Groq {
  if (!_groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GROQ_API_KEY. Set it in .env");
    }
    _groqClient = new Groq({ apiKey });
    log.info("Groq client initialized", { model: DEFAULT_MODEL });
  }
  return _groqClient;
}

// ── Zod schemas & tool definition ────────────────────────────────────────────

export const searchSchema = {
  query: z.string().describe("The search query about the professional profile"),
};

export const semanticSearchTool = {
  name: "semantic_search",
  description:
    "Search the digital twin professional profile using semantic similarity and generate a first-person response. " +
    "Use this to ask questions about the person's experience, skills, education, projects, and career goals.",
  schema: searchSchema,
} as const;

// ── Vector search (matches Python query_vectors) ─────────────────────────────

export async function searchProfile(query: string, topK: number = TOP_K) {
  const index = getVectorIndex();
  log.debug("Vector search started", { query, topK });
  const start = performance.now();
  try {
    const results = await index.query({
      data: query,
      topK,
      includeMetadata: true,
    });
    const durationMs = Math.round(performance.now() - start);
    log.info("Vector search completed", { query, results: results.length, durationMs });
    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error("Vector search failed", { query, error: message });
    throw new Error(`Upstash Vector query failed: ${message}`);
  }
}

// ── Groq generation (matches Python generate_response_with_groq) ─────────────

export async function generateResponse(prompt: string) {
  const client = getGroqClient();
  log.debug("Groq generation started", { promptLength: prompt.length });
  const start = performance.now();
  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an AI digital twin. Answer questions as if you are the person, " +
          "speaking in first person about your background, skills, and experience.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });
  const durationMs = Math.round(performance.now() - start);
  const tokens = completion.usage?.total_tokens ?? 0;
  log.info("Groq generation completed", { durationMs, tokens, model: DEFAULT_MODEL });
  return completion.choices[0].message.content?.trim() ?? "";
}

// ── Combined RAG: search + generate (matches Python rag_query) ───────────────

export interface SearchSource {
  title: string;
  score: number;
}

export interface SemanticSearchResult {
  answer: string;
  sources: SearchSource[];
}

export async function semanticSearch(query: string): Promise<SemanticSearchResult> {
  log.info("RAG pipeline started", { query });
  const pipelineStart = performance.now();

  // Step 1: Vector search
  const results = await searchProfile(query);

  if (!results || results.length === 0) {
    return {
      answer: "I don't have specific information about that topic.",
      sources: [],
    };
  }

  // Step 2: Extract relevant content
  const topDocs: string[] = [];
  const sources: SearchSource[] = [];

  for (const result of results) {
    const metadata = result.metadata as Record<string, unknown> | undefined;
    const title = (metadata?.title as string) ?? "Information";
    const content = (metadata?.content as string) ?? "";
    const score = result.score;

    sources.push({ title, score });
    if (content) {
      topDocs.push(`${title}: ${content}`);
    }
  }

  if (topDocs.length === 0) {
    return {
      answer: "I found some information but couldn't extract details.",
      sources,
    };
  }

  // Step 3: Generate response with context (matches Python prompt exactly)
  const context = topDocs.join("\n\n");
  const prompt = `Based on the following information about yourself, answer the question.
Speak in first person as if you are describing your own background.

Your Information:
${context}

Question: ${query}

Provide a helpful, professional response:`;

  const answer = await generateResponse(prompt);
  const totalMs = Math.round(performance.now() - pipelineStart);
  log.info("RAG pipeline completed", { query, totalMs, sourcesUsed: sources.length });
  return { answer, sources };
}

// ── Database seeding (matches Python setup_vector_database) ──────────────────

export async function seedDatabase(
  chunks: ProfileChunk[],
  reset: boolean = false
): Promise<number> {
  const index = getVectorIndex();

  log.info("Database seed started", { chunks: chunks.length, reset });
  const start = performance.now();
  try {
    if (reset) {
      log.info("Resetting vector database");
      await index.reset();
    }

  const vectors = chunks.map((chunk) => ({
    id: chunk.id,
    data: `${chunk.title}: ${chunk.content}`,
    metadata: {
      title: chunk.title,
      type: chunk.type,
      content: chunk.content,
      category: chunk.category,
      tags: chunk.tags,
    },
  }));

    await index.upsert(vectors);
    const durationMs = Math.round(performance.now() - start);
    log.info("Database seed completed", { vectors: vectors.length, durationMs });
    return vectors.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error("Database seed failed", { error: message, chunks: chunks.length });
    throw new Error(`Upstash Vector seed failed: ${message}`);
  }
}

// ── Database info ────────────────────────────────────────────────────────────

export async function getDatabaseInfo() {
  const index = getVectorIndex();
  return await index.info();
}
