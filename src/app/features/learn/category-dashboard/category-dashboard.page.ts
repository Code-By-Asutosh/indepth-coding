import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { findCategory } from '../../../core/data/categories.data';
import { SideNav } from '../../../shared/components/side-nav/side-nav';

@Component({
  selector: 'app-category-dashboard-page',
  imports: [RouterOutlet, RouterLink, SideNav],
  templateUrl: './category-dashboard.page.html',
  styleUrl: './category-dashboard.page.scss'
})
export class CategoryDashboardPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categoryId = input.required<string>();

  protected readonly category = computed(() => findCategory(this.categoryId()));

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null)
    )
  );

  /** Which topic (if any) the currently active child route belongs to, so the side nav can auto-expand it. */
  protected readonly activeTopicId = computed(() => {
    this.navigationEnd();
    let child = this.route.firstChild;
    while (child?.firstChild) {
      child = child.firstChild;
    }
    return child?.snapshot.paramMap.get('topicId') ?? null;
  });
}
