import sys
import os

# Add project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

try:
    # Try importing as if we are at project root (runtime with sys.path hack)
    from core.llm import LLMService
    from config import Config
except ImportError:
    # Try relative/local import (IDE might prefer this if analyzing file in isolation)
    try:
        from llm import LLMService
        from ..config import Config
    except ImportError:
        # Fallback for when running directly inside core without parent path
        sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))
        from core.llm import LLMService
        from config import Config

def test_llm():
    print("Testing LLM Service...")
    print(f"Provider: {Config.DEFAULT_PROVIDER}")
    print(f"Gemini Key Present: {bool(Config.GOOGLE_API_KEY)}")
    print(f"OpenAI Key Present: {bool(Config.OPENAI_API_KEY)}")

    llm = LLMService()
    
    # Test 1: Simple Generation
    print("\n--- Test 1: Simple Text Generation ---")
    response = llm.generate("Hello, are you working?", model="mock-model")
    print(f"Response: {response}")

    # Test 2: JSON Generation
    print("\n--- Test 2: JSON Generation ---")
    json_response = llm.generate_json(
        "Generate a JSON object with a 'message' field saying hello.",
        schema={"type": "object", "properties": {"message": {"type": "string"}}}
    )
    print(f"JSON Response: {json_response}")

    if llm.provider == "mock":
        print("\nNote: Running in MOCK mode because API keys are missing or provider is set to 'mock'.")

if __name__ == "__main__":
    test_llm()
