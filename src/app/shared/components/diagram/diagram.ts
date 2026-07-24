import { AfterViewInit, Component, ElementRef, ViewChild, input, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import mermaid from 'mermaid';

let mermaidInitialized = false;
let diagramCounter = 0;

/**
 * Renders a Mermaid diagram from a text definition. Used sparingly on
 * concept pages where a visual (memory layout, class hierarchy, request
 * flow) genuinely clarifies the concept faster than prose alone.
 */
@Component({
  selector: 'app-diagram',
  templateUrl: './diagram.html',
  styleUrl: './diagram.scss'
})
export class Diagram implements AfterViewInit {
  readonly definition = input.required<string>();
  readonly caption = input<string | null>(null);

  @ViewChild('container') private container?: ElementRef<HTMLElement>;

  // A signal, not a plain property - this app is zoneless, so setting a
  // plain field after an `await` would never trigger a re-render. Signal
  // writes are what the zoneless change detector actually listens for.
  protected readonly svg = signal<SafeHtml | null>(null);

  constructor(private readonly sanitizer: DomSanitizer) {}

  async ngAfterViewInit(): Promise<void> {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          background: '#08090f',
          primaryColor: '#4f46e5',
          primaryTextColor: '#e8e9f3',
          primaryBorderColor: '#818cf8',
          lineColor: '#9393a8',
          secondaryColor: '#06b6d4',
          tertiaryColor: '#121826',
          fontFamily: 'Inter, system-ui, sans-serif'
        }
      });
      mermaidInitialized = true;
    }

    try {
      const id = `mermaid-diagram-${diagramCounter++}`;
      const { svg } = await mermaid.render(id, this.definition());
      this.svg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
    } catch {
      this.svg.set(null); // fail quietly - a broken diagram should never break the page
    }
  }
}
