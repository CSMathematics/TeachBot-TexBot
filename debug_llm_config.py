
import sys
import os

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.getcwd(), 'EduTeX_Agents'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

print(f"Project Root: {PROJECT_ROOT}")

try:
    from config import Config
    print("--- Config Check ---")
    print(f"GOOGLE_API_KEY present: {bool(Config.GOOGLE_API_KEY)}")
    if Config.GOOGLE_API_KEY:
        print(f"API Key Length: {len(Config.GOOGLE_API_KEY)}")
        print(f"API Key Prefix: {Config.GOOGLE_API_KEY[:4]}...")
    
    print(f"DEFAULT_PROVIDER: {Config.DEFAULT_PROVIDER}")

    # Inspect Available Models
    import urllib.request
    import json # Re-add import
    
    key = Config.GOOGLE_API_KEY
    print(f"Using Config Key: {key[:5]}...")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
    
    
    # Test generateContent directly
    model_name = "gemini-2.0-flash-exp" # Trying 2.0 or 2.5 based on output seen? 
    # Wait, output said "Gemini 2.5 Flash", name is likely "models/gemini-2.5-flash"
    # So model_name should probably be "gemini-2.5-flash" IF it's public.
    # But usually it's "gemini-2.0-flash-exp". 
    # Let's try "gemini-1.5-pro" first as a safer bet if 1.5-flash is missing.
    # Actually, let's try "gemini-1.5-pro"
    model_name = "gemini-1.5-pro"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
    print(f"\n--- Testing Generate Content at {url} ---")
    
    payload = {
        "contents": [{
            "parts": [{"text": "Hello, verify you are working."}]
        }]
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            print("Generate Success!")
            print(result)
    except Exception as e:
        print(f"Generate Failed: {e}")
        try:
             if hasattr(e, 'read'):
                print(e.read().decode())
        except: pass
    except Exception as e:
        print(f"Error listing models: {e}")

    # Continue with generation test
    from core.llm import LLMService
    print("\n--- LLM Service Check ---")
    llm = LLMService(provider="gemini")
    print(f"Initialized Provider: {llm.provider}")
    
    if llm.provider == "mock":
        print("Service fell back to mock immediately.")
    else:
        print("Attempting generation...")
        try:
            response = llm.generate("Hello, are you working?")
            print(f"Response: {response}")
        except Exception as e:
            print(f"Generation Error: {e}")

except Exception as e:
    print(f"Setup Error: {e}")
