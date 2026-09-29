import { Routes } from '@angular/router';

/** Lazy routes: each page's code is downloaded only when it is first visited (see ADR-005). */
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/photos/photos.page'), title: 'Photos' },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites.page'),
    title: 'Favorites',
  },
  {
    path: 'photos/:id',
    loadComponent: () => import('./features/photo-detail/photo-detail.page'),
    title: 'Photo',
  },
  { path: '**', redirectTo: '' },
];
