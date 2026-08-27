import { Component, input } from '@angular/core';
import { DiagramTone } from '../../../../core/models/content.model';

/** Vertical layer cake — JVM memory areas, protocol stacks, architecture tiers. */
@Component({
  selector: 'app-diagram-stack',
  templateUrl: './diagram-stack.html',
  styleUrl: './diagram-stack.scss'
})
export class DiagramStack {
  readonly layers = input.required<{ id: string; label: string; detail?: string; tone?: DiagramTone }[]>();

  protected toneClass(tone?: DiagramTone): string {
    return `dg-tone-${tone ?? 'brand'}`;
  }
}
