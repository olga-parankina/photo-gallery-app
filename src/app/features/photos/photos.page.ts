import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { FavoritesStore } from '../../core/favorites/favorites.store';
import { PhotoApi } from '../../core/photos/photo-api';
import { Photo } from '../../core/photos/photo.model';
import { InfiniteScroll } from '../../shared/directives/infinite-scroll.directive';
import { Loader } from '../../shared/ui/loader/loader';
import { PhotoGrid } from '../../shared/ui/photo-grid/photo-grid';

const BATCH_SIZE = 12;

/** Route `/`: endless random photo stream; a click adds the photo to favorites. */
@Component({
  selector: 'app-photos-page',
  imports: [PhotoGrid, Loader, InfiniteScroll, MatButton],
  templateUrl: './photos.page.html',
  styleUrl: './photos.page.scss',
})
export default class PhotosPage {
  private readonly api = inject(PhotoApi);
  private readonly favorites = inject(FavoritesStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly photos = signal<readonly Photo[]>([]);
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  protected readonly favoriteIds = this.favorites.favorites;

  protected loadMore(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.failed.set(false);

    this.api
      .getPhotos(BATCH_SIZE)
      .pipe(
        // Runs on success, error and unsubscribe: the loader can never get stuck.
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (batch) => this.photos.update((photos) => [...photos, ...batch]),
        error: () => this.failed.set(true),
      });
  }

  protected addToFavorites(photo: Photo): void {
    if (this.favorites.isFavorite(photo.id)) return;
    this.favorites.add(photo.id);
    this.snackBar.open('Added to favorites', undefined, { duration: 2000 });
  }
}
