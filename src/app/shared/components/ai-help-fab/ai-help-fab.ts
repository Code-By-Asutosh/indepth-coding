import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface AiMessage {
  role: 'user' | 'assistant';
  text: string;
}

/**
 * Floating "ask AI" box. Supports: highlight text on the page -> right-click
 * -> a custom "Ask AI about this" menu item -> opens the panel pre-filled
 * with the selection.
 *
 * NOTE: this only builds the UI/interaction shell. It does NOT call the
 * Gemini API yet — this is a static, backend-less Angular app, and calling
 * Gemini directly from the browser would mean shipping the API key in the
 * client bundle (anyone can read it in devtools/network tab and burn your
 * quota or run up billing). Wire this up later through a small serverless
 * proxy (e.g. a Cloudflare Worker/Vercel function) that holds the key
 * server-side — don't put the key directly in this app.
 */
@Component({
  selector: 'app-ai-help-fab',
  imports: [FormsModule],
  templateUrl: './ai-help-fab.html',
  styleUrl: './ai-help-fab.scss'
})
export class AiHelpFab {
  protected readonly panelOpen = signal(false);
  protected readonly menuVisible = signal(false);
  protected readonly menuPosition = signal({ x: 0, y: 0 });
  protected readonly draftQuestion = signal('');
  protected readonly selectedText = signal('');
  protected readonly messages = signal<AiMessage[]>([]);

  @HostListener('document:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    const selection = window.getSelection()?.toString().trim() ?? '';
    if (!selection) {
      this.menuVisible.set(false);
      return;
    }
    event.preventDefault();
    this.selectedText.set(selection);
    this.menuPosition.set({ x: event.clientX, y: event.clientY });
    this.menuVisible.set(true);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.menuVisible.set(false);
  }

  protected openWithSelection(): void {
    this.panelOpen.set(true);
    this.menuVisible.set(false);
  }

  protected openPanel(): void {
    this.panelOpen.set(true);
  }

  protected closePanel(): void {
    this.panelOpen.set(false);
  }

  protected send(): void {
    const question = this.draftQuestion().trim();
    if (!question) return;

    const context = this.selectedText();
    const fullQuestion = context ? `${question}\n\n> "${context}"` : question;
    this.messages.update((msgs) => [...msgs, { role: 'user', text: fullQuestion }]);
    this.draftQuestion.set('');
    this.selectedText.set('');

    // Placeholder response — replace with a real call to a server-side proxy.
    this.messages.update((msgs) => [
      ...msgs,
      { role: 'assistant', text: 'AI answers are not wired up yet — this box is ready for a Gemini-backed proxy once we build one.' }
    ]);
  }
}
