import json
import os
import time
from typing import Dict, Any, Optional, List, Union
import google.generativeai as genai
from openai import OpenAI
from config import Config

class LLMService:
    def __init__(self, provider: str = None):
        self.provider = provider or Config.DEFAULT_PROVIDER
        self.client = None
        self._setup_client()

    def _setup_client(self):
        if self.provider == "gemini":
            if Config.GOOGLE_API_KEY:
                genai.configure(api_key=Config.GOOGLE_API_KEY)
            else:
                print("Warning: Google API Key missing. Falling back to Mock.")
                self.provider = "mock"

        elif self.provider == "openai":
            if Config.OPENAI_API_KEY:
                self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
            else:
                print("Warning: OpenAI API Key missing. Falling back to Mock.")
                self.provider = "mock"

    def generate(self, prompt: str, system_instruction: str = "", model: str = None) -> str:
        """
        Generates text content.
        """
        if self.provider == "mock":
            return self._mock_response(prompt)

        try:
            if self.provider == "gemini":
                model_name = model or Config.GEMINI_MODEL
                generation_config = {
                    "temperature": Config.Temperature,
                    "max_output_tokens": Config.MaxOutputTokens,
                }
                model_instance = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction
                )
                response = model_instance.generate_content(prompt, generation_config=generation_config)
                return response.text

            elif self.provider == "openai":
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
                return response.choices[0].message.content

        except Exception as e:
            print(f"LLM Error ({self.provider}): {e}")
            return self._mock_response(prompt, error=str(e))

    def generate_json(self, prompt: str, schema: Dict[str, Any] = None, system_instruction: str = "", model: str = None) -> Dict[str, Any]:
        """
        Generates a JSON response, enforcing schema if possible.
        """
        if self.provider == "mock":
            return {"mock_response": "True", "input": prompt[:50]}

        system_instruction += "\nIMPORTANT: Output MUST be valid JSON."
        
        text_response = self.generate(prompt, system_instruction, model)
        
        # Clean up markdown code blocks if present
        cleaned_text = text_response.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
            
        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            print(f"JSON Decode Error. Raw output: {text_response[:100]}...")
            # Fallback: simple retry or return raw text in a dict
            return {"error": "Invalid JSON", "raw_text": text_response}

    def _mock_response(self, prompt: str, error: str = None) -> str:
        """
        Fallback response for testing without costs/keys.
        """
        if error:
            return f"[LLM ERROR: {error}] Mock response for: {prompt[:50]}..."
        return f"[MOCK AI] Generated content for: {prompt[:50]}..."
