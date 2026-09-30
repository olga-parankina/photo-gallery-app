import { Component, computed, input, output, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { Photo } from '../../../core/photos/photo.model';
import { photoUrl } from '../../../core/photos/photo-url';

@Component({
  selector: 'app-photo-card',
  imports: [MatIcon],
  templateUrl: './photo-card.html',
  styleUrl: './photo-card.scss',
})
export class PhotoCard {
  readonly photo = input.required<Photo>();
  /** Accessible name = what a click does, e.g. "Add photo to favorites". */
  readonly label = input.required<string>();
  readonly favorite = input(false);

  readonly selected = output<Photo>();
  readonly unfavorite = output<Photo>();

  protected readonly src = computed(() => photoUrl(this.photo().id, 'thumb'));
  /** Set when the image fails to load; shows text instead of a fallback image (no onerror loop). */
  protected readonly failed = signal(false);
}
