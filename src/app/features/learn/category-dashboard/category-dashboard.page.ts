import { toSignal } from '@angular/core/rxjs-interop';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
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

  /** Mobile/tablet drawer state - the sidebar is hidden below the lg breakpoint otherwise. */
  protected readonly mobileNavOpen = signal(false);

  protected toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }

  private readonly navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null)
    )
  );

  constructor() {
    // Auto-close the mobile drawer any time navigation happens (e.g. tapping a concept link inside it).
    effect(() => {
      this.navigationEnd();
      this.mobileNavOpen.set(false);
    });
  }

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
