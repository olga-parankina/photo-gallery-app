import { Component, input, output } from '@angular/core';

import { Photo } from '../../../core/photos/photo.model';
import { PhotoCard } from '../photo-card/photo-card';

/** Presentational grid of photo cards (2 columns on phones, 3 from tablet up, as in the wireframe). */
@Component({
  selector: 'app-photo-grid',
  imports: [PhotoCard],
  templateUrl: './photo-grid.html',
  styleUrl: './photo-grid.scss',
})
export class PhotoGrid {
  readonly photos = input.required<readonly Photo[]>();
  readonly actionLabel = input.required<string>();
  readonly favoriteIds = input<readonly string[]>([]);
  /** Label for photos that are already favorites; defaults to actionLabel. */
  readonly favoriteActionLabel = input<string>();

  readonly photoClick = output<Photo>();
}
