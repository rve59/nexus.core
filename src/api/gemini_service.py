import os
from google import genai
from typing import Optional, Dict, Any
import json

class GeminiService:
    """
    A service class to handle interactions with the Gemini LLM using the modern google-genai library.
    Supports a 'mock' mode for UI/UX testing without live API calls.
    """
    
    def __init__(self, api_key: Optional[str] = None, model_id: str = 'gemini-3-flash-preview', mock: bool = False):
        self.mock = mock
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model_id = model_id
        
        if not self.mock:
            if not self.api_key:
                raise ValueError("Gemini API Key not found. Please set GEMINI_API_KEY in your environment.")
            self.client = genai.Client(api_key=self.api_key)
        else:
            print(f"[INFO] GeminiService initialized in MOCK mode (Model: {self.model_id}).")

    def generate_content(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Sends a prompt to Gemini (or returns a mock response).
        Uses the modern google-genai Client.
        """
        if self.mock:
            return self._generate_mock_response(prompt)
        
        try:
            config = {}
            if system_instruction:
                config['system_instruction'] = system_instruction
            
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=config
            )
            return response.text
        except Exception as e:
            return f"Error communicating with Gemini (Modern API): {str(e)}"

    def _generate_mock_response(self, prompt: str) -> str:
        """
        Returns a sensible mock response for MGT synthesis.
        """
        # Crude detection of which layer is being synthesized
        if "Storage & Persistence Layer" in prompt or "Chapter 2.C" in prompt:
            return json.dumps({
                "layer": "Storage & Persistence",
                "components": [
                    {"name": "SessionStore", "type": "Redis", "purpose": "Ephemeral state storage"},
                    {"name": "MemoryGraph", "type": "Neo4j", "purpose": "Long-term relationship mapping"}
                ],
                "rationale": "Mock response for architectural validation."
            }, indent=2)
        
        if "Logic & Orchestration Layer" in prompt or "Chapter 2.B" in prompt:
            return json.dumps({
                "layer": "Logic & Orchestration",
                "orchestrator": "NexusStream",
                "events": ["INTENT_CAPTURE", "SYNTHESIS_LOOP"],
                "rationale": "Mock response for orchestration testing."
            }, indent=2)

        return f"MOCK RESPONSE for: {prompt[:50]}..."

if __name__ == "__main__":
    # Test Live Mode if key is present
    from dotenv import load_dotenv
    load_dotenv()
    
    key = os.getenv("GEMINI_API_KEY")
    if key:
        print(f"Testing Live Mode with key: {key[:5]}... (Model: {GeminiService().model_id})")
        service = GeminiService(mock=False)
        prompt = "Q: What are the three core layers of the Nexus MGT architecture?\nA:"
        result = service.generate_content(prompt)
        print(f"Prompt: {prompt}")
        print(f"Result: {result}")
    else:
        print("No API Key found for test.")
