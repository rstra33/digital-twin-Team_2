import { NextRequest, NextResponse } from 'next/server';
import { Index } from '@upstash/vector';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params, id } = body;

    if (method === 'ping') {
      return NextResponse.json({
        jsonrpc: '2.0',
        result: 'pong',
        id,
      });
    }

    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        result: {
          tools: [
            {
              name: 'semantic_search',
              description: 'Search the digital twin profile using semantic similarity',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'The search query',
                  },
                  top_k: {
                    type: 'number',
                    description: 'Number of results to return',
                    default: 3,
                  },
                },
                required: ['query'],
              },
            },
          ],
        },
        id,
      });
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params;

      if (name === 'semantic_search') {
        const results = await index.query({
          data: args.query,
          topK: args.top_k || 3,
          includeMetadata: true,
        });

        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results),
              },
            ],
          },
          id,
        });
      }
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32601, message: 'Method not found' },
      id,
    });

  } catch (error) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error' },
      id: null,
    });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Digital Twin MCP Server running' });
}