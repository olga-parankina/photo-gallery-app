import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Photo } from '../../../core/photos/photo.model';
import { PhotoGrid } from './photo-grid';

describe('PhotoGrid', () => {
  let fixture: ComponentFixture<PhotoGrid>;
  const photos: Photo[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  async function render(inputs: Record<string, unknown>) {
    fixture = TestBed.createComponent(PhotoGrid);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    await fixture.whenStable();
  }

  const buttons = () =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));

  it('renders one card per photo', async () => {
    await render({ photos, actionLabel: 'Open photo' });

    expect(buttons()).toHaveLength(3);
  });

  it('re-emits the clicked photo', async () => {
    await render({ photos, actionLabel: 'Open photo' });
    const clicked: Photo[] = [];
    fixture.componentInstance.photoClick.subscribe((p: Photo) => clicked.push(p));

    buttons()[1].click();

    expect(clicked).toEqual([{ id: 'b' }]);
  });

  it('marks favorite photos and gives them their own label', async () => {
    await render({
      photos,
      actionLabel: 'Add photo to favorites',
      favoriteIds: ['b'],
      favoriteActionLabel: 'Photo is already in favorites',
    });

    expect(buttons().map((b) => b.getAttribute('aria-label'))).toEqual([
      'Add photo to favorites',
      'Photo is already in favorites',
      'Add photo to favorites',
    ]);
    expect(buttons().map((b) => b.querySelector('.badge') !== null)).toEqual([false, true, false]);
  });
});
