import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/groups',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.routes),
    canActivate: [GuestGuard],
  },
  {
    path: 'groups',
    loadChildren: () => import('./features/groups/groups.routes').then((m) => m.routes),
    canActivate: [AuthGuard],
  },
  {
    path: 'lists',
    loadChildren: () => import('./features/lists/lists.routes').then((m) => m.routes),
    canActivate: [AuthGuard],
  },
  {
    path: 'items',
    loadChildren: () => import('./features/items/items.routes').then((m) => m.routes),
    canActivate: [AuthGuard],
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [AuthGuard],
  },
];
