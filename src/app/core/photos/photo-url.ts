export type PhotoSize = 'thumb' | 'full';

const DIMENSIONS: Record<PhotoSize, string> = {
  thumb: '200/300',
  full: '800/1200',
};

/** The single place that knows how a photo id maps to an image URL (see ADR-001). */
export function photoUrl(id: string, size: PhotoSize): string {
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/${DIMENSIONS[size]}`;
}
