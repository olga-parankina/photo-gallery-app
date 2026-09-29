import { Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { Router, RouterLink, isActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatToolbar, MatButton, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly router = inject(Router);

  protected readonly photosActive = isActive('/', this.router, { paths: 'exact' });

  private readonly onFavoritesList = isActive('/favorites', this.router);
  private readonly onPhotoDetail = isActive('/photos', this.router);
  /** The detail page only shows favorite photos, so it belongs to the Favorites section. */
  protected readonly favoritesActive = computed(
    () => this.onFavoritesList() || this.onPhotoDetail(),
  );
}
