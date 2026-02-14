import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Config:
    # API Keys
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "").strip() or None
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip() or None

    # Model Preferences (User requested high-end)
    # Fallback to standard robust models if specific versions aren't valid API slugs yet
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash") 
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

    # Global Settings
    DEFAULT_PROVIDER = os.getenv("LLM_PROVIDER", "gemini") # 'gemini' or 'openai' or 'mock'
    Temperature = 0.7
    MaxOutputTokens = 8192

    @staticmethod
    def is_configured():
        if Config.DEFAULT_PROVIDER == "gemini" and Config.GOOGLE_API_KEY:
            return True
        if Config.DEFAULT_PROVIDER == "openai" and Config.OPENAI_API_KEY:
            return True
        return False
