import { Component, computed, inject, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { FavoritesStore } from '../../core/favorites/favorites.store';
import { photoUrl } from '../../core/photos/photo-url';

@Component({
  selector: 'app-photo-detail-page',
  imports: [MatButton, RouterLink],
  templateUrl: './photo-detail.page.html',
  styleUrl: './photo-detail.page.scss',
})
export default class PhotoDetailPage {
  private readonly favorites = inject(FavoritesStore);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly id = input.required<string>();

  protected readonly isFavorite = computed(() => this.favorites.isFavorite(this.id()));
  protected readonly src = computed(() => photoUrl(this.id(), 'full'));
  protected readonly failed = signal(false);

  /**
   * Navigate first, then remove: removing first would flip `isFavorite()` and flash the
   * "not found" state until the Favorites page has loaded.
   */
  protected async remove(): Promise<void> {
    const id = this.id();
    const navigated = await this.router.navigate(['/favorites']);
    if (!navigated) return;
    this.favorites.remove(id);
    this.snackBar.open('Removed from favorites', undefined, { duration: 2000 });
  }
}
