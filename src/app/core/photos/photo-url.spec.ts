import { photoUrl } from './photo-url';

describe('photoUrl', () => {
  it('builds a 200x300 thumbnail URL from the photo id', () => {
    expect(photoUrl('abc', 'thumb')).toBe('https://picsum.photos/seed/abc/200/300');
  });

  it('builds a larger URL of the same image for the detail page', () => {
    expect(photoUrl('abc', 'full')).toBe('https://picsum.photos/seed/abc/800/1200');
  });

  it('encodes the id so it cannot break the URL path', () => {
    expect(photoUrl('a/b c', 'thumb')).toBe('https://picsum.photos/seed/a%2Fb%20c/200/300');
  });
});
