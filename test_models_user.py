
import urllib.request
import json
import os
import sys

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.getcwd(), 'EduTeX_Agents'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from config import Config

def test_model(model_name):
    key = Config.GOOGLE_API_KEY
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={key}"
    print(f"\n--- Testing Model: {model_name} ---")
    
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
            print("SUCCESS!")
            # print(result)
            return True
    except Exception as e:
        print(f"FAILED: {e}")
        try:
             if hasattr(e, 'read'):
                print(e.read().decode())
        except: pass
        return False

# Test specifically discovered models
models_to_test = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
for m in models_to_test:
    test_model(m)
