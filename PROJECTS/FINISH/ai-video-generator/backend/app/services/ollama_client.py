"""Ollama client for LLM interactions."""

import httpx
import json
from typing import Optional, Dict, Any, List
from app.config import settings
from app.exceptions import ScriptParsingException
from app.utils.logger import get_logger

logger = get_logger(__name__)


class OllamaClient:
    """Client for interacting with Ollama API."""
    
    def __init__(self, base_url: Optional[str] = None, timeout: int = 120):
        """
        Initialize Ollama client.
        
        Args:
            base_url: Ollama API base URL (defaults to settings)
            timeout: Request timeout in seconds
        """
        self.base_url = base_url or settings.ollama_url
        self.timeout = timeout
        self.default_model = "llama3.2:1b"  # Lightweight model for systems with limited RAM
        
        logger.info(f"Initialized Ollama client: {self.base_url}")
    
    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False,
    ) -> str:
        """
        Generate text completion from Ollama.
        
        Args:
            prompt: Input prompt
            model: Model name (defaults to llama3)
            system: System prompt for context
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            
        Returns:
            Generated text
            
        Raises:
            ScriptParsingException: If generation fails
        """
        model = model or self.default_model
        
        logger.debug(
            f"Generating with Ollama",
            extra={
                "model": model,
                "prompt_length": len(prompt),
                "temperature": temperature,
            },
        )
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {
                    "model": model,
                    "prompt": prompt,
                    "stream": stream,
                    "options": {
                        "temperature": temperature,
                    },
                }
                
                if system:
                    payload["system"] = system
                
                if max_tokens:
                    payload["options"]["num_predict"] = max_tokens
                
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload,
                )
                
                response.raise_for_status()
                
                if stream:
                    # Handle streaming response
                    full_response = ""
                    async for line in response.aiter_lines():
                        if line:
                            data = json.loads(line)
                            if "response" in data:
                                full_response += data["response"]
                    return full_response
                else:
                    # Handle non-streaming response
                    result = response.json()
                    return result.get("response", "")
        
        except httpx.HTTPError as e:
            logger.error(f"Ollama HTTP error: {str(e)}")
            raise ScriptParsingException(
                "Failed to communicate with Ollama",
                details={"error": str(e), "model": model},
            )
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Ollama response: {str(e)}")
            raise ScriptParsingException(
                "Invalid response from Ollama",
                details={"error": str(e)},
            )
        except Exception as e:
            logger.error(f"Unexpected error in Ollama generation: {str(e)}")
            raise ScriptParsingException(
                "Unexpected error during text generation",
                details={"error": str(e)},
            )
    
    async def generate_json(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Generate JSON response from Ollama.
        
        Args:
            prompt: Input prompt
            model: Model name
            system: System prompt
            temperature: Sampling temperature
            
        Returns:
            Parsed JSON response
            
        Raises:
            ScriptParsingException: If generation or parsing fails
        """
        # Add JSON formatting instruction to system prompt
        json_system = (system or "") + "\n\nYou must respond with valid JSON only. No additional text."
        
        response_text = await self.generate(
            prompt=prompt,
            model=model,
            system=json_system,
            temperature=temperature,
        )
        
        try:
            # Try to extract JSON from response
            # Sometimes LLMs add markdown code blocks
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            
            return json.loads(response_text)
        
        except json.JSONDecodeError as e:
            logger.error(
                f"Failed to parse JSON from Ollama: {str(e)}",
                extra={"response": response_text[:500]},
            )
            raise ScriptParsingException(
                "Failed to parse JSON response from LLM",
                details={"error": str(e), "response_preview": response_text[:200]},
            )
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        """
        Chat completion with message history.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name
            temperature: Sampling temperature
            
        Returns:
            Assistant's response
            
        Raises:
            ScriptParsingException: If chat fails
        """
        model = model or self.default_model
        
        logger.debug(
            f"Chat with Ollama",
            extra={"model": model, "message_count": len(messages)},
        )
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": model,
                        "messages": messages,
                        "stream": False,
                        "options": {"temperature": temperature},
                    },
                )
                
                response.raise_for_status()
                result = response.json()
                
                return result.get("message", {}).get("content", "")
        
        except httpx.HTTPError as e:
            logger.error(f"Ollama chat error: {str(e)}")
            raise ScriptParsingException(
                "Failed to chat with Ollama",
                details={"error": str(e), "model": model},
            )
    
    async def list_models(self) -> List[str]:
        """
        List available models in Ollama.
        
        Returns:
            List of model names
            
        Raises:
            ScriptParsingException: If listing fails
        """
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                
                result = response.json()
                models = [model["name"] for model in result.get("models", [])]
                
                logger.info(f"Available Ollama models: {models}")
                return models
        
        except httpx.HTTPError as e:
            logger.error(f"Failed to list Ollama models: {str(e)}")
            raise ScriptParsingException(
                "Failed to list available models",
                details={"error": str(e)},
            )
    
    async def pull_model(self, model: str) -> bool:
        """
        Pull/download a model in Ollama.
        
        Args:
            model: Model name to pull
            
        Returns:
            True if successful
            
        Raises:
            ScriptParsingException: If pull fails
        """
        logger.info(f"Pulling Ollama model: {model}")
        
        try:
            async with httpx.AsyncClient(timeout=600) as client:  # 10 min timeout for download
                response = await client.post(
                    f"{self.base_url}/api/pull",
                    json={"name": model},
                )
                
                response.raise_for_status()
                logger.info(f"Successfully pulled model: {model}")
                return True
        
        except httpx.HTTPError as e:
            logger.error(f"Failed to pull model {model}: {str(e)}")
            raise ScriptParsingException(
                f"Failed to pull model {model}",
                details={"error": str(e)},
            )
    
    async def check_health(self) -> bool:
        """
        Check if Ollama service is healthy.
        
        Returns:
            True if healthy, False otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception as e:
            logger.warning(f"Ollama health check failed: {str(e)}")
            return False


# Global client instance
_ollama_client: Optional[OllamaClient] = None


def get_ollama_client() -> OllamaClient:
    """
    Get or create global Ollama client instance.
    
    Returns:
        OllamaClient instance
    """
    global _ollama_client
    if _ollama_client is None:
        _ollama_client = OllamaClient()
    return _ollama_client
