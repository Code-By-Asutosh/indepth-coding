import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface PrevNextTarget {
  title: string;
  link: (string | number)[];
}

@Component({
  selector: 'app-prev-next-nav',
  imports: [RouterLink],
  templateUrl: './prev-next-nav.html',
  styleUrl: './prev-next-nav.scss'
})
export class PrevNextNav {
  readonly prev = input<PrevNextTarget | null>(null);
  readonly next = input<PrevNextTarget | null>(null);
}
