import json
import os
import time
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List, Union
# from openai import OpenAI # Optional if you want to keep OpenAI support
try:
    from config import Config  # type: ignore
except ImportError:
    # Fallback for relative import if run directly or from different context
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from config import Config  # type: ignore

class LLMService:
    def __init__(self, provider: Optional[str] = None, api_key: Optional[str] = None):
        self.provider = provider or Config.DEFAULT_PROVIDER
        self.api_key = api_key
        self.client = None
        self._setup_client()

    def _setup_client(self):
        if self.provider == "gemini":
            # Check effective key (params or config)
            key = self.api_key or Config.GOOGLE_API_KEY
            if not key:
                print("Warning: Google API Key missing. Falling back to Mock.")
                self.provider = "mock"
        
        elif self.provider == "openai":
            # Keeping OpenAI logic commented or simple for now if needed
            key = self.api_key or Config.OPENAI_API_KEY
            if key:
                from openai import OpenAI  # type: ignore
                self.client = OpenAI(api_key=key)
            else:
                print("Warning: OpenAI API Key missing. Falling back to Mock.")
                self.provider = "mock"

    def generate(self, prompt: str, system_instruction: str = "", model: Optional[str] = None) -> str:
        """
        Generates text content.
        """
        if self.provider == "mock":
            return self._mock_response(prompt)

        try:
            if self.provider == "gemini":
                return self._call_gemini_rest(prompt, system_instruction, model)

            elif self.provider == "openai":
                if self.client is None:
                     raise RuntimeError("OpenAI client not initialized")
                     
                model_name = model or Config.OPENAI_MODEL
                response = self.client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=Config.Temperature,
                    max_tokens=Config.MaxOutputTokens
                )
                content = response.choices[0].message.content
                return content if content else "" # Ensure string return

        except Exception as e:
            print(f"LLM Error ({self.provider}): {e}")
            # User requested NO MOCK DATA. Re-raise exception.
            raise e
            # return self._mock_response(prompt, error=str(e))
        
        if self.provider == "mock":
             return self._mock_response(prompt)

        # If we reach here with non-mock provider, something is wrong
        raise RuntimeError(f"Provider {self.provider} failed to generate content.")

    def _call_gemini_rest(self, prompt: str, system_instruction: str, model: Optional[str] = None) -> str:
        """
        Direct REST API call to Google Gemini to avoid SDK issues.
        """
        api_key = self.api_key or Config.GOOGLE_API_KEY
        model_name = model or Config.GEMINI_MODEL # Use config value
        
        # Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        
        # Construct payload
        # Structure: { "contents": [{ "parts": [{"text": "..."}] }], "system_instruction": ... }
        
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": Config.Temperature,
                "maxOutputTokens": Config.MaxOutputTokens
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        headers = {'Content-Type': 'application/json'}
        data = json.dumps(payload).encode('utf-8')
        
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        max_retries = 3
        base_delay = 2
        
        for attempt in range(max_retries + 1):
            try:
                with urllib.request.urlopen(req) as response:
                    response_body = response.read().decode('utf-8')
                    result = json.loads(response_body)
                    
                    # Parse response
                    # Expected: { "candidates": [ { "content": { "parts": [ { "text": "..." } ] } } ] }
                    candidates = result.get("candidates", [])
                    if candidates:
                        content_parts = candidates[0].get("content", {}).get("parts", [{}])
                        text = content_parts[0].get("text", "")
                        return text
                    else:
                        raise ValueError("No candidates returned")
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt < max_retries:
                    delay = base_delay * (2 ** attempt)
                    print(f"Gemini 429 Rate Limit. Retrying in {delay}s...")
                    time.sleep(delay)
                    continue
                
                print(f"HTTP Error calling Gemini: {e.code} {e.reason}")
                try:
                    error_body = e.read().decode('utf-8')
                    print(f"Error details: {error_body}")
                except:
                    pass
                raise
            except Exception as e:
                print(f"Error calling/parsing Gemini response: {e}")
                raise
        
        raise RuntimeError("Retries exhausted or unexpected error in Gemini call")

    def generate_json(self, prompt: str, schema: Optional[Dict[str, Any]] = None, system_instruction: str = "", model: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates a JSON response, enforcing schema if possible.
        """
        if self.provider == "mock":
            return {"mock_response": "True", "input": prompt[:50]}  # type: ignore

        system_instruction += "\nIMPORTANT: Output MUST be valid JSON, strictly compliant with JSON syntax. Do not use Markdown code blocks."
        
        text_response = self.generate(prompt, system_instruction, model)
        
        # Clean up markdown code blocks if present
        cleaned_text = text_response.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]  # type: ignore
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]  # type: ignore
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]  # type: ignore
            
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            print(f"JSON Decode Error. Raw output: {text_response[:100]}...")  # type: ignore
            # Attempt to find JSON object in text
            try:
                start = cleaned_text.find("{")
                end = cleaned_text.rfind("}") + 1
                if start != -1 and end != -1:
                    return json.loads(cleaned_text[start:end])  # type: ignore
            except:
                pass
            return {"error": "Invalid JSON", "raw_text": text_response}

    def _mock_response(self, prompt: str, error: Optional[str] = None) -> str:
        """
        Fallback response for testing without costs/keys.
        """
        if error:
            return f"[LLM ERROR: {error}] Mock response for: {prompt[:50]}..."
        return f"[MOCK AI] Generated content for: {prompt[:50]}..."
