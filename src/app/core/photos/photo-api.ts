import { Observable } from 'rxjs';

import { Photo } from './photo.model';

/** An abstract class, not an interface: it must exist at runtime to be a DI token. */
export abstract class PhotoApi {
  abstract getPhotos(count: number): Observable<Photo[]>;
}
