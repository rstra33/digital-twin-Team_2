"""
Digital Twin RAG Application
Based on Binal's production implementation
- Upstash Vector: Built-in embeddings and vector storage
- Groq: Ultra-fast LLM inference
"""

import os
import json
from dotenv import load_dotenv
from upstash_vector import Index
from groq import Groq

# Load environment variables
load_dotenv()

# Constants
JSON_FILE = "digitaltwin.json"  #INSERT YOUR OWN JSON FILE HERE
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
DEFAULT_MODEL = "llama-3.1-8b-instant"

def setup_groq_client():
    """Setup Groq client"""
    if not GROQ_API_KEY:
        print("❌ GROQ_API_KEY not found in .env file")
        return None
    
    try:
        client = Groq(api_key=GROQ_API_KEY)
        print("✅ Groq client initialized successfully!")
        return client
    except Exception as e:
        print(f"❌ Error initializing Groq client: {str(e)}")
        return None

def build_chunks_from_profile(profile_data):
    """Convert structured profile JSON into content chunks for vector embedding"""
    chunks = []
    chunk_id = 1

    # Personal summary
    personal = profile_data.get('personal', {})
    if personal:
        summary_parts = []
        if personal.get('name'):
            summary_parts.append(f"Name: {personal['name']}")
        if personal.get('title'):
            summary_parts.append(f"Title: {personal['title']}")
        if personal.get('location'):
            summary_parts.append(f"Location: {personal['location']}")
        if personal.get('summary'):
            summary_parts.append(personal['summary'])
        if personal.get('elevator_pitch'):
            summary_parts.append(f"Elevator pitch: {personal['elevator_pitch']}")
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': 'Personal Summary',
            'type': 'personal',
            'content': ' | '.join(summary_parts),
            'category': 'overview',
            'tags': ['personal', 'summary', 'overview']
        })
        chunk_id += 1

    # Contact info
    contact = personal.get('contact', {})
    if contact:
        contact_parts = [f"{k}: {v}" for k, v in contact.items() if v]
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': 'Contact Information',
            'type': 'personal',
            'content': ' | '.join(contact_parts),
            'category': 'contact',
            'tags': ['contact']
        })
        chunk_id += 1

    # Salary and location preferences
    salary = profile_data.get('salary_location', {})
    if salary:
        sal_parts = [f"{k}: {v}" for k, v in salary.items() if v]
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': 'Salary and Location Preferences',
            'type': 'preferences',
            'content': ' | '.join(str(p) for p in sal_parts),
            'category': 'preferences',
            'tags': ['salary', 'location', 'preferences']
        })
        chunk_id += 1

    # Experience - one chunk per role
    for exp in profile_data.get('experience', []):
        exp_parts = []
        exp_parts.append(f"{exp.get('title', '')} at {exp.get('company', '')}")
        if exp.get('duration'):
            exp_parts.append(f"Duration: {exp['duration']}")
        if exp.get('company_context'):
            exp_parts.append(f"Context: {exp['company_context']}")
        if exp.get('team_structure'):
            exp_parts.append(f"Team: {exp['team_structure']}")
        for star in exp.get('achievements_star', []):
            exp_parts.append(
                f"Achievement — Situation: {star.get('situation', '')}. "
                f"Task: {star.get('task', '')}. "
                f"Action: {star.get('action', '')}. "
                f"Result: {star.get('result', '')}"
            )
        if exp.get('technical_skills_used'):
            exp_parts.append(f"Skills used: {', '.join(exp['technical_skills_used'])}")
        if exp.get('leadership_examples'):
            exp_parts.append(f"Leadership: {', '.join(exp['leadership_examples'])}")
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': f"Experience — {exp.get('title', '')} at {exp.get('company', '')}",
            'type': 'experience',
            'content': ' | '.join(exp_parts),
            'category': 'experience',
<<<<<<< HEAD
            'tags': ['experience', (exp.get('company') or '').lower()]
=======
            'tags': ['experience', exp.get('company', '').lower()]
>>>>>>> 9a1038a1d33dcebb76b83c6c6625b2a29b8410ef
        })
        chunk_id += 1

    # Technical skills
    skills = profile_data.get('skills', {})
    tech = skills.get('technical', {})
    if tech:
        tech_parts = []
        for lang in tech.get('programming_languages', []):
<<<<<<< HEAD
            language = lang.get('language')
            if not language:
                continue
            tech_parts.append(
                f"{language} ({lang.get('proficiency', '')}, {lang.get('years', '')} years)"
=======
            tech_parts.append(
                f"{lang['language']} ({lang.get('proficiency', '')}, {lang.get('years', '')} years)"
>>>>>>> 9a1038a1d33dcebb76b83c6c6625b2a29b8410ef
            )
        if tech.get('databases'):
            tech_parts.append(f"Databases: {', '.join(tech['databases'])}")
        if tech.get('cloud_platforms'):
            tech_parts.append(f"Platforms: {', '.join(tech['cloud_platforms'])}")
        if tech.get('ai_ml'):
            tech_parts.append(f"AI/ML: {', '.join(tech['ai_ml'])}")
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': 'Technical Skills',
            'type': 'skills',
            'content': ' | '.join(tech_parts),
            'category': 'skills',
            'tags': ['skills', 'technical']
        })
        chunk_id += 1

    # Mathematical foundations
    math_skills = skills.get('mathematical_foundations', [])
    if math_skills:
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': 'Mathematical Foundations',
            'type': 'skills',
            'content': ', '.join(math_skills),
            'category': 'skills',
            'tags': ['skills', 'mathematics']
        })
        chunk_id += 1

    # Soft skills
    soft = skills.get('soft_skills', [])
    if soft:
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': 'Soft Skills',
            'type': 'skills',
            'content': ', '.join(soft),
            'category': 'skills',
            'tags': ['skills', 'soft']
        })
        chunk_id += 1

    # Education
    edu = profile_data.get('education', {})
    if edu:
        edu_parts = []
        edu_parts.append(f"{edu.get('degree', '')} at {edu.get('university', '')}")
        if edu.get('major'):
            edu_parts.append(f"Major: {edu['major']}")
        if edu.get('minor'):
            edu_parts.append(f"Minor: {edu['minor']}")
        if edu.get('gpa'):
            edu_parts.append(f"GPA: {edu['gpa']}")
        if edu.get('status'):
            edu_parts.append(f"Status: {edu['status']}")
        if edu.get('relevant_coursework'):
            edu_parts.append(f"Coursework: {', '.join(edu['relevant_coursework'])}")
        if edu.get('awards'):
            edu_parts.append(f"Awards: {', '.join(edu['awards'])}")
        secondary = edu.get('secondary', {})
        if secondary:
            edu_parts.append(
                f"Secondary: {secondary.get('school', '')} — ATAR {secondary.get('atar', '')}"
            )
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': 'Education',
            'type': 'education',
            'content': ' | '.join(edu_parts),
            'category': 'education',
            'tags': ['education', 'university', 'gpa']
        })
        chunk_id += 1

    # Projects
    for proj in profile_data.get('projects_portfolio', []):
        proj_parts = [proj.get('name', ''), proj.get('description', '')]
        if proj.get('technologies'):
            proj_parts.append(f"Technologies: {', '.join(proj['technologies'])}")
        if proj.get('impact'):
            proj_parts.append(f"Impact: {proj['impact']}")
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': f"Project — {proj.get('name', '')}",
            'type': 'project',
            'content': ' | '.join(proj_parts),
            'category': 'projects',
            'tags': ['project']
        })
        chunk_id += 1

    # Career goals
    goals = profile_data.get('career_goals', {})
    if goals:
        goal_parts = []
        if goals.get('short_term'):
            goal_parts.append(f"Short-term: {goals['short_term']}")
        if goals.get('long_term'):
            goal_parts.append(f"Long-term: {goals['long_term']}")
        if goals.get('learning_focus'):
            goal_parts.append(f"Learning focus: {', '.join(goals['learning_focus'])}")
        if goals.get('industries_interested'):
            goal_parts.append(f"Industries: {', '.join(goals['industries_interested'])}")
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': 'Career Goals',
            'type': 'career',
            'content': ' | '.join(goal_parts),
            'category': 'career',
            'tags': ['career', 'goals']
        })
        chunk_id += 1

    # Professional development / Trading experience
    dev = profile_data.get('professional_development', {})
    if dev:
        dev_parts = []
        if dev.get('recent_learning'):
            dev_parts.append(f"Recent learning: {', '.join(dev['recent_learning'])}")
        trading = dev.get('trading_experience', {})
        if trading:
            dev_parts.append(
                f"Trading: {trading.get('focus', '')} for {trading.get('duration', '')}. "
                f"Experience: {', '.join(trading.get('experience_type', []))}. "
                f"Skills: {', '.join(trading.get('skills_developed', []))}"
            )
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': 'Professional Development and Trading',
            'type': 'development',
            'content': ' | '.join(dev_parts),
            'category': 'development',
            'tags': ['development', 'trading', 'learning']
        })
        chunk_id += 1

    # Interview prep - weakness mitigation
    interview = profile_data.get('interview_prep', {})
    weaknesses = interview.get('weakness_mitigation', [])
    if weaknesses:
        w_parts = []
        for w in weaknesses:
            w_parts.append(f"Weakness: {w.get('weakness', '')} — Mitigation: {w.get('mitigation', '')}")
        chunks.append({
            'id': f'chunk-{chunk_id}',
            'title': 'Weakness Mitigation',
            'type': 'interview',
            'content': ' | '.join(w_parts),
            'category': 'interview',
            'tags': ['interview', 'weaknesses']
        })
        chunk_id += 1

    return chunks


def setup_vector_database():
    """Setup Upstash Vector database with built-in embeddings"""
    print("🔄 Setting up Upstash Vector database...")
    
    try:
        index = Index.from_env()
        print("✅ Connected to Upstash Vector successfully!")
        
        # Check current vector count
        try:
            info = index.info()
            current_count = getattr(info, 'vector_count', 0)
            print(f"📊 Current vectors in database: {current_count}")
        except:
            current_count = 0
        
        # Reset database if it has stale data, then reload
<<<<<<< HEAD
        reset_requested = os.getenv("RESET_UPSTASH_INDEX", "").strip().lower() in ("1", "true", "yes", "on")
        if current_count > 0 and reset_requested:
            print("🔄 Resetting database...")
            index.reset()
            current_count = 0
        elif current_count > 0:
            print("ℹ️ Existing vectors found. Set RESET_UPSTASH_INDEX=true to rebuild.")
=======
        if current_count > 0:
            print("🔄 Resetting database to reload with correct profile data...")
            index.reset()
            current_count = 0
>>>>>>> 9a1038a1d33dcebb76b83c6c6625b2a29b8410ef
        
        if current_count == 0:
            print("📝 Loading your professional profile...")
            
            try:
                with open(JSON_FILE, "r", encoding="utf-8") as f:
                    profile_data = json.load(f)
            except FileNotFoundError:
                print(f"❌ {JSON_FILE} not found!")
                return None
            
            # Build chunks from the structured profile JSON
            content_chunks = build_chunks_from_profile(profile_data)
            
            if not content_chunks:
                print("❌ No content chunks could be built from profile data")
                return None
            
            # Prepare vectors
            vectors = []
            for chunk in content_chunks:
                enriched_text = f"{chunk['title']}: {chunk['content']}"
                
                vectors.append((
                    chunk['id'],
                    enriched_text,
                    {
                        "title": chunk['title'],
                        "type": chunk['type'],
                        "content": chunk['content'],
                        "category": chunk.get('category', ''),
                        "tags": chunk.get('tags', [])
                    }
                ))
            
            # Upload vectors
            index.upsert(vectors=vectors)
            print(f"✅ Successfully uploaded {len(vectors)} content chunks!")
        
        return index
        
    except Exception as e:
        print(f"❌ Error setting up database: {str(e)}")
        return None

def query_vectors(index, query_text, top_k=3):
    """Query Upstash Vector for similar vectors"""
    try:
        results = index.query(
            data=query_text,
            top_k=top_k,
            include_metadata=True
        )
        return results
    except Exception as e:
        print(f"❌ Error querying vectors: {str(e)}")
        return None

def generate_response_with_groq(client, prompt, model=DEFAULT_MODEL):
    """Generate response using Groq"""
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI digital twin. Answer questions as if you are the person, speaking in first person about your background, skills, and experience."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return completion.choices[0].message.content.strip()
        
    except Exception as e:
        return f"❌ Error generating response: {str(e)}"

def rag_query(index, groq_client, question):
    """Perform RAG query using Upstash Vector + Groq"""
    try:
        # Step 1: Query vector database
        results = query_vectors(index, question, top_k=3)
        
        if not results or len(results) == 0:
            return "I don't have specific information about that topic."
        
        # Step 2: Extract relevant content
        print("\n🧠 Searching your professional profile...\n")
        
        top_docs = []
        for result in results:
            metadata = result.metadata or {}
            title = metadata.get('title', 'Information')
            content = metadata.get('content', '')
            score = result.score
            
            print(f"🔹 Found: {title} (Relevance: {score:.3f})")
            if content:
                top_docs.append(f"{title}: {content}")
        
        if not top_docs:
            return "I found some information but couldn't extract details."
        
        print(f"⚡ Generating personalized response...\n")
        
        # Step 3: Generate response with context
        context = "\n\n".join(top_docs)
        prompt = f"""Based on the following information about yourself, answer the question.
Speak in first person as if you are describing your own background.

Your Information:
{context}

Question: {question}

Provide a helpful, professional response:"""
        
        response = generate_response_with_groq(groq_client, prompt)
        return response
    
    except Exception as e:
        return f"❌ Error during query: {str(e)}"

def main():
    """Main application loop"""
    print("🤖 Your Digital Twin - AI Profile Assistant")
    print("=" * 50)
    print("🔗 Vector Storage: Upstash (built-in embeddings)")
    print(f"⚡ AI Inference: Groq ({DEFAULT_MODEL})")
    print("📋 Data Source: Your Professional Profile\n")
    
    # Setup clients
    groq_client = setup_groq_client()
    if not groq_client:
        return
    
    index = setup_vector_database()
    if not index:
        return
    
    print("✅ Your Digital Twin is ready!\n")
    
    # Interactive chat loop
    print("🤖 Chat with your AI Digital Twin!")
    print("Ask questions about your experience, skills, projects, or career goals.")
    print("Type 'exit' to quit.\n")
    
    print("💭 Try asking:")
    print("  - 'Tell me about your work experience'")
    print("  - 'What are your technical skills?'")
    print("  - 'Describe your career goals'")
    print()
    
    while True:
        question = input("You: ")
        if question.lower() in ["exit", "quit"]:
            print("👋 Thanks for chatting with your Digital Twin!")
            break
        
        if question.strip():
            answer = rag_query(index, groq_client, question)
            print(f"🤖 Digital Twin: {answer}\n")

if __name__ == "__main__":
    main()