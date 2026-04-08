"""
Digital Twin RAG Application - Multi-Profile Namespace Version
Based on Binal's production implementation
- Upstash Vector: Built-in embeddings and vector storage with namespaces
- Groq: Ultra-fast LLM inference
- Supports multiple profiles in separate namespaces
"""

import os
import json
import time
from dotenv import load_dotenv
from upstash_vector import Index
from groq import Groq

# Load environment variables
load_dotenv()

# Constants
PROFILES = {
    "alaine": "digitaltwin_Alaine.json",
    "john": "digitaltwin.json"
}
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

def setup_vector_database():
    """Setup Upstash Vector database with built-in embeddings"""
    print("🔄 Setting up Upstash Vector database...")
    
    try:
        index = Index.from_env()
        print("✅ Connected to Upstash Vector successfully!")
        
        # Load all profiles into their respective namespaces
        for namespace, json_file in PROFILES.items():
            print(f"\n📋 Processing profile: {namespace.upper()}")
            print(f"📝 Loading {namespace}'s professional profile from {json_file}...")
            
            try:
                with open(json_file, "r", encoding="utf-8") as f:
                    profile_data = json.load(f)
            except FileNotFoundError:
                print(f"❌ {json_file} not found! Skipping {namespace}...")
                continue
            
            # Prepare vectors from content chunks
            vectors = []
            content_chunks = profile_data.get('content_chunks', [])
            
            print(f"📄 DEBUG: Found {len(content_chunks)} content chunks in {json_file}")
            
            if not content_chunks:
                print(f"❌ No content chunks found in {json_file}")
                continue
            
            for chunk in content_chunks:
                enriched_text = f"{chunk['title']}: {chunk['content']}"
                
                vectors.append((
                    chunk['id'],
                    enriched_text,
                    {
                        "title": chunk['title'],
                        "type": chunk['type'],
                        "content": chunk['content'],
                        "category": chunk.get('metadata', {}).get('category', ''),
                        "tags": chunk.get('metadata', {}).get('tags', [])
                    }
                ))
            
            # Upload vectors to namespace (upsert is safe to run multiple times)
            print(f"📤 DEBUG: Uploading {len(vectors)} vectors to namespace '{namespace}'...")
            try:
                index.upsert(vectors=vectors, namespace=namespace)
                print(f"✅ Successfully uploaded {len(vectors)} content chunks to namespace '{namespace}'!")
            except Exception as e:
                print(f"❌ Upsert failed for namespace '{namespace}': {str(e)}")
                continue
        
        # Wait for Upstash to index the vectors
        print("\n⏳ Waiting for vectors to be indexed...")
        time.sleep(3)
        
        # Verify vectors are accessible in each namespace
        for namespace in PROFILES.keys():
            try:
                test_results = index.query(
                    data="background",
                    top_k=1,
                    include_metadata=True,
                    namespace=namespace
                )
                print(f"✅ Namespace '{namespace}': {len(test_results)} vectors accessible")
            except Exception as e:
                print(f"⚠️ Namespace '{namespace}' verification failed: {str(e)}")
        
        return index
        
    except Exception as e:
        print(f"❌ Error setting up database: {str(e)}")
        return None

def query_vectors(index, query_text, namespace, top_k=3):
    """Query Upstash Vector for similar vectors in specific namespace"""
    try:
        print(f"\n🔍 DEBUG: Querying namespace '{namespace}' with: '{query_text}'")
        results = index.query(
            data=query_text,
            top_k=top_k,
            include_metadata=True,
            namespace=namespace
        )
        print(f"🔍 DEBUG: Query returned {len(results)} results")
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

def rag_query(index, groq_client, question, namespace):
    """Perform RAG query using Upstash Vector + Groq"""
    try:
        # Step 1: Query vector database
        results = query_vectors(index, question, namespace, top_k=3)
        
        if not results or len(results) == 0:
            return "I don't have specific information about that topic."
        
        # Step 2: Extract relevant content
        print("\n🧠 Searching professional profile...\n")
        
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

def select_profile():
    """Allow user to select which profile to chat with"""
    print("\n📋 Available Digital Twins:")
    profiles_list = list(PROFILES.keys())
    
    for i, profile in enumerate(profiles_list, 1):
        print(f"  {i}. {profile.upper()}")
    
    while True:
        try:
            choice = input(f"\nSelect a profile (1-{len(profiles_list)}): ").strip()
            index = int(choice) - 1
            
            if 0 <= index < len(profiles_list):
                selected = profiles_list[index]
                print(f"\n✅ You selected: {selected.upper()}")
                return selected
            else:
                print("❌ Invalid choice. Please try again.")
        except ValueError:
            print("❌ Please enter a valid number.")

def main():
    """Main application loop"""
    print("🤖 Digital Twin - Multi-Profile AI Assistant")
    print("=" * 50)
    print("🔗 Vector Storage: Upstash (namespaced embeddings)")
    print(f"⚡ AI Inference: Groq ({DEFAULT_MODEL})")
    print(f"📋 Available Profiles: {', '.join([p.upper() for p in PROFILES.keys()])}\n")
    
    # Setup clients
    groq_client = setup_groq_client()
    if not groq_client:
        return
    
    index = setup_vector_database()
    if not index:
        return
    
    print("\n✅ Digital Twin system is ready!\n")
    
    # Main chat loop
    while True:
        # Select profile
        selected_profile = select_profile()
        
        print(f"\n🤖 Chat with {selected_profile.upper()}'s AI Digital Twin!")
        print("Ask questions about their experience, skills, projects, or career goals.")
        print("Type 'back' to select a different profile or 'exit' to quit.\n")
        
        print("💭 Try asking:")
        print("  - 'Tell me about your background'")
        print("  - 'What are your technical skills?'")
        print("  - 'Describe your career goals'")
        print()
        
        # Chat with selected profile
        while True:
            question = input(f"{selected_profile.upper()} (You): ").strip().lower()
            
            if question == "exit":
                print("👋 Thanks for chatting with Digital Twins!")
                return
            
            if question == "back":
                print("🔙 Returning to profile selection...\n")
                break
            
            if question:
                answer = rag_query(index, groq_client, question, selected_profile)
                print(f"🤖 {selected_profile.upper()}: {answer}\n")
            else:
                print("Please enter a question or type 'back' / 'exit'.\n")

if __name__ == "__main__":
    main()
