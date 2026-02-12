import sys
import os
from fastapi.testclient import TestClient

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

try:
    from api.main import app
    print("Successfully imported api.main")
    
    client = TestClient(app)
    response = client.get("/")
    print(f"Health check status: {response.status_code}")
    print(f"Health check response: {response.json()}")
    
    agents_response = client.get("/api/agents")
    print(f"Agents endpoint status: {agents_response.status_code}")
    print(f"Agents found: {len(agents_response.json())}")
    
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Runtime Error: {e}")
    sys.exit(1)
