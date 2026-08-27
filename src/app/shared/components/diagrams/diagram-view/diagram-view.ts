import { Component, computed, input } from '@angular/core';
import { DiagramDefinition } from '../../../../core/models/content.model';
import { DiagramFlow } from '../diagram-flow/diagram-flow';
import { DiagramHub } from '../diagram-hub/diagram-hub';
import { DiagramSplit } from '../diagram-split/diagram-split';
import { DiagramStack } from '../diagram-stack/diagram-stack';
import { DiagramTimeline } from '../diagram-timeline/diagram-timeline';

/**
 * Dispatcher for structured native-CSS diagrams. Keeps the historical
 * `app-diagram` selector; renders whichever variant the definition carries.
 * Pure templates + scoped DOM — zero innerHTML anywhere in this family.
 */
@Component({
  selector: 'app-diagram',
  imports: [DiagramFlow, DiagramStack, DiagramHub, DiagramSplit, DiagramTimeline],
  templateUrl: './diagram-view.html',
  styleUrl: './diagram-view.scss'
})
export class DiagramView {
  readonly definition = input.required<DiagramDefinition>();
  readonly caption = input<string | undefined>(undefined);

  // Per-variant aliases: the template type-checker can't narrow a union
  // through `@switch` on a signal call, but it CAN narrow `@if (x; as y)`.
  protected readonly asFlow = computed(() => {
    const def = this.definition();
    return def.variant === 'flow' ? def : null;
  });
  protected readonly asStack = computed(() => {
    const def = this.definition();
    return def.variant === 'stack' ? def : null;
  });
  protected readonly asHub = computed(() => {
    const def = this.definition();
    return def.variant === 'hub' ? def : null;
  });
  protected readonly asSplit = computed(() => {
    const def = this.definition();
    return def.variant === 'split' ? def : null;
  });
  protected readonly asTimeline = computed(() => {
    const def = this.definition();
    return def.variant === 'timeline' ? def : null;
  });

  /** Human-readable summary for assistive tech + role="img" semantics. */
  protected readonly ariaLabel = computed(() => {
    const def = this.definition();
    switch (def.variant) {
      case 'flow':
        return `Flow diagram: ${def.nodes.map((n) => n.label).join(' → ')}`;
      case 'stack':
        return `Layer stack diagram: ${def.layers.map((l) => l.label).join(', ')}`;
      case 'hub':
        return `Diagram: ${def.hub.label} connected to ${def.spokes.map((s) => s.node.label).join(', ')}`;
      case 'split':
        return `Comparison: ${def.left.title} versus ${def.right.title}`;
      case 'timeline':
        return `Step-by-step diagram with ${def.steps.length} steps`;
      default:
        return 'Diagram';
    }
  });
}
