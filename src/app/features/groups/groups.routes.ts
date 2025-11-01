import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./groups.page').then((m) => m.GroupsPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./group-details/group-details-simple.page').then((m) => m.GroupDetailsPage),
  },
];
