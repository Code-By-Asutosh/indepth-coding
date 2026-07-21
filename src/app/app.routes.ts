import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.page').then((m) => m.LandingPage)
  },
  {
    path: 'learn/:categoryId',
    loadChildren: () => import('./features/learn/learn.routes').then((m) => m.LEARN_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
