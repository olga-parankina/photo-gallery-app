import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, map, timer } from 'rxjs';

import { PhotoApi } from './photo-api';
import { Photo } from './photo.model';

/** Source of randomness in [0, 1); replaced in tests to make the delay deterministic. */
export const RANDOM = new InjectionToken<() => number>('RANDOM', {
  providedIn: 'root',
  factory: () => Math.random,
});

const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 300;

/** Emulates a real API: new random photos after a random 200–300 ms delay (see ADR-002). */
@Injectable()
export class FakePhotoApi extends PhotoApi {
  private readonly random = inject(RANDOM);

  getPhotos(count: number): Observable<Photo[]> {
    return timer(this.randomDelayMs()).pipe(
      map(() => Array.from({ length: count }, () => ({ id: crypto.randomUUID() }))),
    );
  }

  private randomDelayMs(): number {
    return MIN_DELAY_MS + Math.floor(this.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));
  }
}
