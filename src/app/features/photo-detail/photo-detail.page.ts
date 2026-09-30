import { Component, computed, inject, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { FavoritesStore } from '../../core/favorites/favorites.store';
import { photoUrl } from '../../core/photos/photo-url';

/**
 * Route `/photos/:id`: one large favorite photo with "Remove from favorites" (see ADR-005).
 * Follows the wireframe: photo at content width, fitted to the viewport so the button stays visible.
 */
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

  /** Bound from the `:id` route param via withComponentInputBinding(). */
  readonly id = input.required<string>();

  /** Recomputes if the id changes or the photo is removed elsewhere. */
  protected readonly isFavorite = computed(() => this.favorites.favorites().includes(this.id()));
  protected readonly src = computed(() => photoUrl(this.id(), 'full'));
  protected readonly failed = signal(false);

  protected remove(): void {
    this.favorites.remove(this.id());
    this.snackBar.open('Removed from favorites', undefined, { duration: 2000 });
    void this.router.navigate(['/favorites']);
  }
}
