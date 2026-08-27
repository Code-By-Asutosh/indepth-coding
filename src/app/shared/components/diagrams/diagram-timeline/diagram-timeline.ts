import { Component, computed, input } from '@angular/core';

/** Numbered step rail (N°01…) for mechanisms that unfold over time. */
@Component({
  selector: 'app-diagram-timeline',
  templateUrl: './diagram-timeline.html',
  styleUrl: './diagram-timeline.scss'
})
export class DiagramTimeline {
  readonly steps = input.required<{ id: string; label: string; detail?: string }[]>();

  protected readonly numbered = computed(() =>
    this.steps().map((step, i) => ({ ...step, no: String(i + 1).padStart(2, '0') }))
  );
}
