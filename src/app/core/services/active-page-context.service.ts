import { Injectable, signal } from '@angular/core';
import { ConceptContent } from '../models/content.model';

/**
 * Holds the currently viewed concept's content so the floating AI helper
 * (mounted once, globally, in app.html) knows what page the user is on
 * without every component needing a direct reference to it.
 *
 * `ConceptPagePage` pushes into this on load and clears it on destroy.
 * `AiHelpFab` reads it to build the context sent to the AI proxy.
 */
@Injectable({ providedIn: 'root' })
export class ActivePageContextService {
  readonly content = signal<ConceptContent | null>(null);

  setActiveConcept(content: ConceptContent | null): void {
    this.content.set(content);
  }

  clear(): void {
    this.content.set(null);
  }

  /**
   * Flattens the active concept into a compact plain-text summary suitable
   * for a prompt. Returns null if no concept page is currently active.
   */
  buildContextText(): string | null {
    const c = this.content();
    if (!c) return null;

    const lines: string[] = [
      `Concept: ${c.title}`,
      '',
      c.simpleIntuition,
      '',
      c.formalMeaning,
      '',
      `Why it exists: ${c.whyItExists}`,
      '',
      'How it works internally:'
    ];
    c.howItWorksInternally.forEach((step, i) => lines.push(`${i + 1}. ${step}`));

    lines.push('', 'Real-world examples:');
    c.realWorldExamples.forEach((item) => lines.push(`- ${item}`));

    lines.push('', `Common mistake: ${c.commonMistakes[0] ?? ''}`);

    if (c.triggerSentence) lines.push('', `One-liner: ${c.triggerSentence}`);

    return lines.join('\n');
  }
}

