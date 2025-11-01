import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./items.page').then((m) => m.ItemsPage),
  },
];
