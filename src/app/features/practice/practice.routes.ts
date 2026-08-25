import { Routes } from '@angular/router';

export const PRACTICE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./practice-home/practice-home.page').then((m) => m.PracticeHomePage)
  },
  {
    path: 'assessment',
    loadComponent: () => import('./practice-assessment/practice-assessment.page').then((m) => m.PracticeAssessmentPage)
  },
  {
    path: 'results',
    loadComponent: () => import('./practice-results/practice-results.page').then((m) => m.PracticeResultsPage)
  }
];
