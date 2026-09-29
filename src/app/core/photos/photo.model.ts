/** A photo is identified only by its id; image URLs are derived from it (see photo-url.ts). */
export interface Photo {
  readonly id: string;
}
