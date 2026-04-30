# Presentation Outline

## Slide 5 - Technology Stack: Core Technologies
**Presenter:** Alaine


- Core Technologies: these are what we used for building the system

*Core Technologies*
- VSCode
=> Development environment
- Github Copilot
=> generating code
- Python language
=> implementing Data chunking and upsert to vector database
- Upstash Vector
=> Vector database > Also has built in embedding model (the BGE large model)
- Next.js + Typescript
=> MCP server framework
- Vercel
=> Cloud deployment
- Claude Sonnet
=> Outer agent to orchestrate interviews
- Groq llama 3.1
=> Inner LLM to synthesize first-person answers

---

## Slide 8 - Testing + Validation 
**Presenter:** Alaine

- This slide explains how we tested the Digital Twin project to make sure it behaves correctly

*Testing Approach:*
- We tested the Digital Twin using a wide range of interview questions, similar to what a recruiter or interviewer might ask.
- We also tried to see if the project would make things up and hallucinate details outside the profile data.
- We tested edge cases and adversarial prompts, such as vague or misleading questions, to ensure the Digital Twin still followed its rules and stayed grounded

*Metric:*
- This is an example of the testing on the right.
- In the first test, there were a few hallucinations, but after fixing the bug, hallucinations were not anymore detected
- Explain the picture evidence of the slide

*Collaboration:*
- Each team member worked on their own GitHub branch and developed features, documentation, and testing scenarios independently without breaking the main project
- Then, each change or addition developed will be sent in a Pull Request to merge with the main branch.
- We used GitHub pull request comments to give feedback, suggest improvements, and review each other’s work before merging changes.
