import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { FAVORITES_STORAGE_KEY } from '../../core/favorites/favorites.store';
import FavoritesPage from './favorites.page';

@Component({ template: '' })
class BlankPage {}

describe('FavoritesPage', () => {
  async function open(storedIds: string[] | null) {
    localStorage.clear();
    if (storedIds) localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(storedIds));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: BlankPage },
          { path: 'favorites', component: FavoritesPage },
          { path: 'photos/:id', component: BlankPage },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create('/favorites');
    return { harness, element: harness.routeNativeElement as HTMLElement };
  }

  const imageSrcs = (element: HTMLElement) =>
    Array.from(element.querySelectorAll('img')).map((img) => img.getAttribute('src'));

  it('lists the favorites saved earlier, so they survive a page refresh', async () => {
    const { element } = await open(['a', 'b']);

    expect(imageSrcs(element)).toEqual([
      'https://picsum.photos/seed/a/200/300',
      'https://picsum.photos/seed/b/200/300',
    ]);
  });

  it('labels cards with what a click does here: open the photo', async () => {
    const { element } = await open(['a']);

    expect(element.querySelector('app-photo-card button')?.getAttribute('aria-label')).toBe(
      'Open photo',
    );
  });

  it('opens the single photo page when a photo is clicked', async () => {
    const { harness, element } = await open(['a', 'b']);

    element.querySelectorAll<HTMLButtonElement>('app-photo-card button')[1].click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/photos/b');
  });

  it('shows an empty state with a way back to the photo stream', async () => {
    const { element } = await open(null);

    expect(element.querySelector('app-photo-grid')).toBeNull();
    expect(element.textContent).toContain('No favorites yet');
    expect(element.querySelector('a[href="/"]')?.textContent).toContain('Browse photos');
  });
});
