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
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button.tile'),
    );

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

  it('re-emits a click on the favorite heart as unfavoriteClick', async () => {
    await render({ photos, actionLabel: 'Add photo to favorites', favoriteIds: ['c'] });
    const unfavorited: Photo[] = [];
    fixture.componentInstance.unfavoriteClick.subscribe((p: Photo) => unfavorited.push(p));

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button.badge')!
      .click();

    expect(unfavorited).toEqual([{ id: 'c' }]);
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
    const cards = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('app-photo-card'),
    );
    expect(cards.map((c) => c.querySelector('button.badge') !== null)).toEqual([
      false,
      true,
      false,
    ]);
  });
});
