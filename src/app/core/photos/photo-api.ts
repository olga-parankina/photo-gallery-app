import { Observable } from 'rxjs';

import { Photo } from './photo.model';

/**
 * What pages depend on to get photos (see ADR-002).
 * An abstract class (not an interface) so it exists at runtime and can be a DI token.
 */
export abstract class PhotoApi {
  abstract getPhotos(count: number): Observable<Photo[]>;
}
