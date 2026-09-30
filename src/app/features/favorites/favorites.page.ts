import { Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

import { FavoritesStore } from '../../core/favorites/favorites.store';
import { Photo } from '../../core/photos/photo.model';
import { PhotoGrid } from '../../shared/ui/photo-grid/photo-grid';

/** Route `/favorites`: all favorite photos (no infinite scroll); a click opens the photo. */
@Component({
  selector: 'app-favorites-page',
  imports: [PhotoGrid, MatButton, RouterLink],
  template: `
    <h1 class="visually-hidden">Favorites</h1>

    @if (photos().length > 0) {
      <app-photo-grid [photos]="photos()" actionLabel="Open photo" (photoClick)="open($event)" />
    } @else {
      <section class="empty">
        <p>No favorites yet. Click a photo in the stream to add it here.</p>
        <a matButton="filled" routerLink="/">Browse photos</a>
      </section>
    }
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding-block: 48px;
      text-align: center;
    }
  `,
})
export default class FavoritesPage {
  private readonly router = inject(Router);
  private readonly favorites = inject(FavoritesStore);

  /** Derived from the store, so it updates by itself when a favorite is removed elsewhere. */
  protected readonly photos = computed<Photo[]>(() =>
    this.favorites.favorites().map((id) => ({ id })),
  );

  protected open(photo: Photo): void {
    void this.router.navigate(['/photos', photo.id]);
  }
}
