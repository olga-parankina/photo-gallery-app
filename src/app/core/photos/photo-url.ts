export type PhotoSize = 'thumb' | 'full';

const DIMENSIONS: Record<PhotoSize, string> = {
  thumb: '200/300',
  full: '800/1200',
};

/** The only place that maps a photo id to an image URL; only ids are stored. */
export function photoUrl(id: string, size: PhotoSize): string {
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/${DIMENSIONS[size]}`;
}
