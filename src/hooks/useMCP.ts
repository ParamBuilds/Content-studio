import { useState, useCallback } from 'react';

interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const useMCP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callMCP = useCallback(async (endpoint: string, body: any): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/mcp/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'MCP operation failed');
      
      return data;
    } catch (err: any) {
      const msg = err.message || 'Unknown error';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateText = useCallback((prompt: string, model?: string) => 
    callMCP('chat', { prompt, model }), [callMCP]);

  const generateImage = useCallback((prompt: string, options?: any) => 
    callMCP('image/generate', { prompt, ...options }), [callMCP]);

  const analyzeImage = useCallback((imageUrl: string, prompt: string) => 
    callMCP('image/analyze', { image_url: imageUrl, prompt }), [callMCP]);

  const generateAudio = useCallback((text: string, voice?: string) => 
    callMCP('audio/generate', { text, voice }), [callMCP]);

  const analyzeAudio = useCallback((audioUrl: string) => 
    callMCP('audio/analyze', { audio_url: audioUrl }), [callMCP]);

  return {
    generateText,
    generateImage,
    analyzeImage,
    generateAudio,
    analyzeAudio,
    loading,
    error,
  };
};
