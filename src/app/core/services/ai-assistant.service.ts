import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export class AiAssistantError extends Error {
  constructor(message: string, readonly kind: 'rate-limited' | 'network' | 'server') {
    super(message);
  }
}

/**
 * Talks to the Cloudflare Worker proxy in /ai-proxy, never to Gemini
 * directly. The Worker holds the real API key server-side; this service
 * only ever sees the public Worker URL (see environment.ts).
 */
@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  /**
   * Streams the AI's answer, calling `onChunk` with each incremental piece
   * of text as it arrives (for a typewriter effect). Resolves once the
   * stream ends.
   */
  async streamAnswer(question: string, pageContext: string | null, onChunk: (textSoFar: string) => void): Promise<void> {
    let response: Response;
    try {
      response = await fetch(`${environment.aiProxyUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: pageContext })
      });
    } catch {
      throw new AiAssistantError('Could not reach the AI service. Check your connection and try again.', 'network');
    }

    if (response.status === 429) {
      throw new AiAssistantError("You've hit the question limit for now - try again in a little while.", 'rate-limited');
    }
    if (!response.ok || !response.body) {
      throw new AiAssistantError('The AI service had a problem answering that. Try again in a moment.', 'server');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textSoFar = '';

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      textSoFar += decoder.decode(value, { stream: true });
      onChunk(textSoFar);
    }
  }
}
