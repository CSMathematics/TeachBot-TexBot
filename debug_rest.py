
import urllib.request
import urllib.error
import json
import os
import sys

# Add project root to path
PROJECT_ROOT = os.path.abspath(os.path.join(os.getcwd(), 'EduTeX_Agents'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from config import Config

def test_endpoint(url, method='GET', data=None, headers=None):
    print(f"\n--- Testing {method} {url} ---")
    if headers:
        print(f"Headers: {list(headers.keys())}")
    
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.status}")
            body = response.read().decode('utf-8')
            print(f"Body: {body[:200]}...")
            return True
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} {e.reason}")
        body = e.read().decode('utf-8')
        print(f"Error Body: {body}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

key = Config.GOOGLE_API_KEY
if not key:
    print("NO API KEY FOUND")
    sys.exit(1)

# Test 1: List Models v1beta (Query Param)
test_endpoint(f"https://generativelanguage.googleapis.com/v1beta/models?key={key}")

# Test 2: List Models v1beta (Header)
test_endpoint("https://generativelanguage.googleapis.com/v1beta/models", headers={'x-goog-api-key': key})

# Test 3: Generate Content (gemini-1.5-flash)
generate_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
payload = json.dumps({"contents": [{"parts": [{"text": "Hi"}]}]}).encode('utf-8')
test_endpoint(generate_url, method='POST', data=payload, headers={'Content-Type': 'application/json'})
