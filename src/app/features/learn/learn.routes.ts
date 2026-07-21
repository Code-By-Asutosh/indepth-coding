import { Routes } from '@angular/router';

export const LEARN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./category-dashboard/category-dashboard.page').then((m) => m.CategoryDashboardPage),
    children: [
      {
        path: '',
        loadComponent: () => import('./category-overview/category-overview.page').then((m) => m.CategoryOverviewPage)
      },
      {
        path: ':topicId/:conceptId',
        loadComponent: () => import('./concept-page/concept-page.page').then((m) => m.ConceptPagePage)
      }
    ]
  }
];
