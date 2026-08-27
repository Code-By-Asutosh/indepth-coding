import { Component, input } from '@angular/core';
import { DiagramNode } from '../../../../core/models/content.model';

/**
 * Hub-and-spoke rendered as an org-chart bus: hub chip on top, a connector
 * rail, spokes fanned beneath. Pure CSS borders — no measuring, no SVG.
 */
@Component({
  selector: 'app-diagram-hub',
  templateUrl: './diagram-hub.html',
  styleUrl: './diagram-hub.scss'
})
export class DiagramHub {
  readonly hub = input.required<DiagramNode>();
  readonly spokes = input.required<{ node: DiagramNode; edgeLabel?: string }[]>();

  protected toneClass(node: DiagramNode): string {
    return `dg-tone-${node.tone ?? 'muted'}`;
  }
}
