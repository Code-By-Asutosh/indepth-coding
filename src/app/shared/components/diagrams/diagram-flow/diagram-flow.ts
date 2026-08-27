import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import { DiagramEdge, DiagramNode } from '../../../../core/models/content.model';

interface WirePath {
  d: string;
  dashed: boolean;
}

/** Module-level counter so concurrent diagrams never share SVG marker ids. */
let FLOW_UID = 0;

/**
 * Pipeline / DAG rendered as depth-arranged node chips with real SVG wires
 * between them. Layout = longest-path layering (tiny graphs, O(V·E) is fine),
 * geometry = measured from the DOM after render and re-measured on resize.
 *
 * Zoneless note: all post-render writes go through signals from rAF/observer
 * callbacks.
 */
@Component({
  selector: 'app-diagram-flow',
  templateUrl: './diagram-flow.html',
  styleUrl: './diagram-flow.scss'
})
export class DiagramFlow {
  readonly nodes = input.required<DiagramNode[]>();
  readonly edges = input.required<DiagramEdge[]>();
  readonly direction = input<'lr' | 'tb'>('lr');

  protected readonly uid = `dg-flow-${FLOW_UID++}`;

  /** Nodes grouped into depth columns/rows via longest-path layering. */
  protected readonly columns = computed<DiagramNode[][]>(() => {
    const ids = new Set(this.nodes().map((n) => n.id));
    const adjacency = new Map<string, string[]>();
    for (const edge of this.edges()) {
      if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to) continue;
      adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge.to]);
    }

    const depth = new Map<string, number>(this.nodes().map((n) => [n.id, 0]));
    for (let pass = 0; pass < this.nodes().length; pass++) {
      let changed = false;
      for (const [from, tos] of adjacency) {
        for (const to of tos) {
          const candidate = (depth.get(from) ?? 0) + 1;
          if (candidate > (depth.get(to) ?? 0)) {
            depth.set(to, candidate);
            changed = true;
          }
        }
      }
      if (!changed) break; // converged (cycles just stop improving)
    }

    const columns: DiagramNode[][] = [];
    for (const node of this.nodes()) {
      (columns[depth.get(node.id) ?? 0] ??= []).push(node);
    }
    return columns.map((col) => col ?? []);
  });

  /** Edges carrying labels get a legend strip under the canvas (labels on wires are unreadable at small sizes). */
  protected readonly labeledEdges = computed(() => this.edges().filter((edge) => edge.label && edge.label.trim()));

  private readonly surface = viewChild.required<ElementRef<HTMLDivElement>>('surface');
  private readonly nodeEls = viewChildren<ElementRef<HTMLDivElement>>('nodeEl');

  /** SVG path data in CSS-pixel coordinates matching the surface box 1:1. */
  protected readonly wires = signal<WirePath[]>([]);
  private readonly wireBoxSize = signal<{ w: number; h: number }>({ w: 0, h: 0 });
  protected readonly viewBox = computed(() => `0 0 ${this.wireBoxSize().w} ${this.wireBoxSize().h}`);

  constructor() {
    afterNextRender(() => {
      this.measure();
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => this.scheduleMeasure());
        observer.observe(this.surface().nativeElement);
        inject(DestroyRef).onDestroy(() => observer.disconnect());
      }
    });

    // Re-measure whenever the graph itself changes (content switches pages).
    effect(() => {
      this.nodes();
      this.edges();
      this.direction();
      this.scheduleMeasure();
    });
  }

  protected toneClass(node: DiagramNode): string {
    return `dg-tone-${node.tone ?? 'muted'}`;
  }

  private rafHandle = 0;

  private scheduleMeasure(): void {
    cancelAnimationFrame(this.rafHandle);
    this.rafHandle = requestAnimationFrame(() => this.measure());
  }

  private measure(): void {
    const surfaceEl = this.surface()?.nativeElement;
    if (!surfaceEl || this.nodeEls().length === 0) return;

    const surfaceRect = surfaceEl.getBoundingClientRect();
    this.wireBoxSize.set({ w: surfaceRect.width, h: surfaceRect.height });

    const rects = new Map<string, DOMRect>();
    for (const el of this.nodeEls()) {
      const id = el.nativeElement.dataset['id'];
      if (id) rects.set(id, el.nativeElement.getBoundingClientRect());
    }

    const vertical = this.direction() === 'tb';
    const wires: WirePath[] = [];

    for (const edge of this.edges()) {
      const from = rects.get(edge.from);
      const to = rects.get(edge.to);
      if (!from || !to) continue;

      const rel = (r: DOMRect) => ({
        left: r.left - surfaceRect.left,
        right: r.right - surfaceRect.left,
        top: r.top - surfaceRect.top,
        bottom: r.bottom - surfaceRect.top,
        cx: r.left - surfaceRect.left + r.width / 2,
        cy: r.top - surfaceRect.top + r.height / 2
      });

      const a = rel(from);
      const b = rel(to);

      let d: string;
      if (vertical) {
        const y1 = a.bottom + 2;
        const y2 = b.top - 4;
        const midY = (y1 + y2) / 2;
        d = `M ${a.cx} ${y1} C ${a.cx} ${midY}, ${b.cx} ${midY}, ${b.cx} ${y2}`;
      } else {
        const x1 = a.right + 2;
        const x2 = b.left - 4;
        const midX = (x1 + x2) / 2;
        d = `M ${x1} ${a.cy} C ${midX} ${a.cy}, ${midX} ${b.cy}, ${x2} ${b.cy}`;
      }

      wires.push({ d, dashed: !!edge.dashed });
    }

    this.wires.set(wires);
  }
}
