import { Routes } from '@angular/router';

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
    title: 'Favorite photo',
  },
  { path: '**', redirectTo: '' },
];
