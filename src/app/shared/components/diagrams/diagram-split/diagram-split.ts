import { Component, input } from '@angular/core';

interface SplitSide {
  title: string;
  items: string[];
}

/** Versus comparison — two panels, center divider, optional verdict strip. */
@Component({
  selector: 'app-diagram-split',
  templateUrl: './diagram-split.html',
  styleUrl: './diagram-split.scss'
})
export class DiagramSplit {
  readonly left = input.required<SplitSide>();
  readonly right = input.required<SplitSide>();
  readonly verdict = input<string | undefined>(undefined);
}
