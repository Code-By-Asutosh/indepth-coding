import { AfterViewInit, Component, ElementRef, OnChanges, ViewChild, input, signal } from '@angular/core';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';

/**
 * A single, self-contained syntax-highlighted code block with a header
 * (language + copy button). Used for every code sample on a concept page -
 * centralizing this in one component means every code block gets colorful
 * highlighting and a working copy button for free.
 */
@Component({
  selector: 'app-code-block',
  templateUrl: './code-block.html',
  styleUrl: './code-block.scss'
})
export class CodeBlock implements AfterViewInit, OnChanges {
  readonly language = input.required<string>();
  readonly code = input.required<string>();
  /** Optional small label shown in the header, e.g. "Bad" / "Good". */
  readonly label = input<string | null>(null);
  readonly labelTone = input<'neutral' | 'bad' | 'good'>('neutral');

  @ViewChild('codeEl') private codeEl?: ElementRef<HTMLElement>;

  protected readonly copied = signal(false);

  ngAfterViewInit(): void {
    this.highlight();
  }

  ngOnChanges(): void {
    this.highlight();
  }

  private highlight(): void {
    const el = this.codeEl?.nativeElement;
    if (!el) return;
    // Prism only knows a handful of grammars - anything else (e.g. "text") renders unhighlighted, which is fine.
    if (Prism.languages[this.language()]) {
      Prism.highlightElement(el);
    }
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    } catch {
      /* clipboard unavailable - silently ignore */
    }
  }
}
