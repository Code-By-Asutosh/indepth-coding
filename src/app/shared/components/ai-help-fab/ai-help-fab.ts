import { Component, ElementRef, HostListener, Injector, ViewChild, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Prism from '../../utils/prism';
import { AiAssistantService, AiAssistantError } from '../../../core/services/ai-assistant.service';
import { ActivePageContextService } from '../../../core/services/active-page-context.service';
import { renderChatMarkdown } from '../../utils/markdown';

interface AiMessage {
  role: 'user' | 'assistant';
  text: string;
  status?: 'pending' | 'error';
}

/**
 * Floating "ask AI" box. Supports: highlight text on the page -> right-click
 * -> a custom "Ask AI about this" menu item -> opens the panel pre-filled
 * with the selection.
 *
 * Answers stream in from a Cloudflare Worker proxy (see /ai-proxy) that
 * holds the real Gemini API key server-side - this component never sees
 * the key, only the proxy's public URL (environment.aiProxyUrl).
 *
 * Assistant replies are rendered as Markdown (headers, bold, lists, code
 * blocks with copy buttons) via renderChatMarkdown(), a hand-rolled,
 * escape-first renderer - see shared/utils/markdown.ts for why that's safe.
 */
@Component({
  selector: 'app-ai-help-fab',
  imports: [FormsModule],
  templateUrl: './ai-help-fab.html',
  styleUrl: './ai-help-fab.scss'
})
export class AiHelpFab {
  private readonly aiAssistant = inject(AiAssistantService);
  private readonly activePageContext = inject(ActivePageContextService);
  private readonly injector = inject(Injector);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('messagesContainer') private messagesContainerRef?: ElementRef<HTMLElement>;

  protected readonly panelOpen = signal(false);
  protected readonly fullscreen = signal(false);
  protected readonly menuVisible = signal(false);
  protected readonly menuPosition = signal({ x: 0, y: 0 });
  protected readonly draftQuestion = signal('');
  protected readonly selectedText = signal('');
  protected readonly messages = signal<AiMessage[]>([]);
  protected readonly sending = signal(false);
  protected readonly copiedIndex = signal<number | null>(null);

  /**
   * Messages plus pre-rendered, memoized HTML for assistant replies.
   *
   * `renderChatMarkdown()` HTML-escapes all raw text before building any
   * tag, so the only markup that can ever appear is what this function
   * itself constructs (never arbitrary tags from the AI's raw output).
   * That makes it safe to bypass Angular's default innerHTML sanitizer -
   * which is necessary here because that sanitizer strips <button>
   * elements, breaking the per-code-block copy button. Same trusted-output
   * pattern the Diagram component already uses for Mermaid's rendered SVG.
   */
  protected readonly renderedMessages = computed(() =>
    this.messages().map((message) => ({
      ...message,
      html: message.role === 'assistant' ? this.sanitizer.bypassSecurityTrustHtml(renderChatMarkdown(message.text)) : ('' as SafeHtml)
    }))
  );

  constructor() {
    // Re-run Prism syntax highlighting over any code blocks in the newly
    // rendered assistant HTML, once Angular has actually patched the DOM.
    effect(() => {
      this.renderedMessages();
      afterNextRender(() => this.highlightCode(), { injector: this.injector });
    });
  }

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

  protected toggleFullscreen(): void {
    this.fullscreen.update((value) => !value);
  }

  protected async copyMessage(text: string, index: number): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.update((current) => (current === index ? null : current)), 1500);
    } catch {
      /* clipboard unavailable - silently ignore */
    }
  }

  /**
   * Event delegation for the "Copy" buttons embedded inside AI-rendered
   * markdown code blocks (they're raw DOM from [innerHTML], not Angular
   * components, so they can't have their own (click) bindings).
   */
  protected async onMessagesAreaClick(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLElement>('[data-copy-code]');
    if (!button) return;

    const code = button.closest('.chat-code-block')?.querySelector('code');
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code.textContent ?? '');
      const original = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = original ?? 'Copy';
      }, 1500);
    } catch {
      /* clipboard unavailable - silently ignore */
    }
  }

  private highlightCode(): void {
    const container = this.messagesContainerRef?.nativeElement;
    if (container) Prism.highlightAllUnder(container);
  }

  protected async send(): Promise<void> {
    const question = this.draftQuestion().trim();
    if (!question || this.sending()) return;

    const selection = this.selectedText();
    const fullQuestion = selection ? `${question}\n\n> "${selection}"` : question;
    this.messages.update((msgs) => [...msgs, { role: 'user', text: fullQuestion }]);
    this.draftQuestion.set('');
    this.selectedText.set('');
    this.sending.set(true);

    // Placeholder assistant message we'll fill in as chunks stream in.
    this.messages.update((msgs) => [...msgs, { role: 'assistant', text: '', status: 'pending' }]);
    const assistantIndex = this.messages().length - 1;

    const pageContext = this.activePageContext.buildContextText();
    const promptedQuestion = selection ? `${question}\n\nThe user highlighted this exact text on the page: "${selection}"` : question;

    try {
      await this.aiAssistant.streamAnswer(promptedQuestion, pageContext, (textSoFar) => {
        this.messages.update((msgs) => msgs.map((m, i) => (i === assistantIndex ? { role: 'assistant', text: textSoFar } : m)));
      });
    } catch (err) {
      const message = err instanceof AiAssistantError ? err.message : 'Something went wrong answering that. Try again.';
      this.messages.update((msgs) => msgs.map((m, i) => (i === assistantIndex ? { role: 'assistant', text: message, status: 'error' } : m)));
    } finally {
      this.sending.set(false);
    }
  }
}


