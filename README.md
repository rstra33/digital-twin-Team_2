Digital Twin — RAG-Powered Interview Agent
An AI-powered Digital Twin that conducts professional job interviews on your behalf using Retrieval-Augmented Generation (RAG). The system stores your real professional profile in a vector database, retrieves relevant evidence via semantic search, and generates factual, grounded interview responses — never hallucinating or inventing information.
Built as part of the AusBiz Consulting Digital Twin project (Team 2).

How It Works
Job Description ──→ Agentic LLM (Claude / Groq)
                        │
                        ├── Reads interview instructions (AGENTS.md)
                        ├── Generates interview questions
                        ├── Calls MCP tool for each question
                        │       │
                        │       ▼
                        │   Upstash Vector DB
                        │   (semantic search over profile embeddings)
                        │       │
                        │       ▼
                        ├── Retrieves relevant evidence chunks
                        ├── Synthesises professional answers
                        └── Produces final hiring recommendation report

Embed — Your structured profile JSON is chunked, embedded, and stored in Upstash Vector.
Retrieve — When an interview question is asked, the MCP server performs semantic search to find the most relevant profile chunks.
Generate — The LLM analyses the retrieved evidence and produces an accurate, first-person answer grounded in your real data.
Report — After the full interview, a Markdown report is generated with transcript, evaluation, and a hire/no-hire recommendation.


Repository Structure

```
digital-twin-Team_2/
├── README.md                  ← You are here
├── agents.md                  ← Interview agent instructions and rules
├── docs/
│   └── prd.md                 ← Product Requirements Document
├── digitaltwin.json           ← Structured professional profile data
├── digitaltwin_rag.py         ← Core RAG application (Upstash Vector + Groq)
└── .env                       ← Environment variables (not committed)
```

### Key Files

| File | Purpose |
|---|---|
| [digitaltwin_rag.py](digitaltwin_rag.py) | Core pipeline — connects to Upstash Vector, performs semantic search, generates responses via Groq |
| [digitaltwin.json](digitaltwin.json) | Your professional profile structured into embeddable content chunks |
| [agents.md](agents.md) | Instructions defining how the AI interviewer should behave, evaluate, and report |
| [docs/prd.md](docs/prd.md) | Full Product Requirements Document |

### Tech Stack

| Component | Technology |
|---|---|
| Vector Database | Upstash Vector (built-in embeddings) |
| LLM Inference | Groq (llama-3.1-8b-instant) |
| Agent Mode | VS Code Insiders + GitHub Copilot (Claude Sonnet 4.5) |
| Tool Calling | MCP (Model Context Protocol) server |
| Language | Python |

Getting Started
Prerequisites

Python 3.10+
VS Code Insiders (required for Agent Mode)
GitHub Copilot Pro subscription (for agentic LLM tool-calling)
Upstash account with a Vector index created
Groq API key

### 1. Clone the repository
```bash
git clone https://github.com/rstra33/digital-twin-Team_2.git
cd digital-twin-Team_2
```

### 2. Install dependencies
```bash
pip install python-dotenv upstash-vector groq
```

### 3. Configure environment variables
Create a `.env` file in the project root with your keys:
```
GROQ_API_KEY=your_groq_api_key_here
UPSTASH_VECTOR_REST_URL=your_upstash_url_here
UPSTASH_VECTOR_REST_TOKEN=your_upstash_token_here
```

### 4. Run the application
```bash
python digitaltwin_rag.py
```
On first run, the script detects an empty database, reads `digitaltwin.json`, chunks it, and uploads embeddings to Upstash Vector. Subsequent runs skip this step.

This launches an interactive chat loop where you can ask questions directly and see the RAG pipeline in action.

Final Working Version
The main branch represents the final working version of this project.


License
This project was developed for educational purposes as part of the AusBiz Consulting Digital Twin workshop.