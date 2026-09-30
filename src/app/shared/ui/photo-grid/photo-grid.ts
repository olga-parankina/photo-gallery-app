import { Component, input, output } from '@angular/core';

import { Photo } from '../../../core/photos/photo.model';
import { PhotoCard } from '../photo-card/photo-card';

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
  readonly favoriteActionLabel = input<string>();

  readonly photoClick = output<Photo>();
  readonly unfavoriteClick = output<Photo>();
}
