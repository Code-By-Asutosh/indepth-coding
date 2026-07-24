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

    const lines: string[] = [`Concept: ${c.title}`, '', c.hook, '', c.problem, '', `Core idea: ${c.aha.statement}`, `Analogy: ${c.aha.analogy}`, '', 'How it works:'];
    c.underTheHood.forEach((step, i) => lines.push(`${i + 1}. ${step}`));

    lines.push('', 'Where this shows up:');
    c.inTheWild.forEach((item) => lines.push(`- ${item}`));

    lines.push('', `Common mistake: ${c.commonMistakes[0]?.mistake ?? ''}`, `Why it happens: ${c.commonMistakes[0]?.why ?? ''}`, `Fix: ${c.commonMistakes[0]?.fix ?? ''}`);

    if (c.oneLiner) lines.push('', `One-liner: ${c.oneLiner}`);

    return lines.join('\n');
  }
}
