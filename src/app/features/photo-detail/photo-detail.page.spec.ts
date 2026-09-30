import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { FAVORITES_STORAGE_KEY, FavoritesStore } from '../../core/favorites/favorites.store';
import PhotoDetailPage from './photo-detail.page';

@Component({ template: '' })
class BlankPage {}

describe('PhotoDetailPage', () => {
  async function open(url: string, favorites: string[]) {
    localStorage.clear();
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'favorites', component: BlankPage },
            { path: 'photos/:id', component: PhotoDetailPage },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    return { harness, element: harness.routeNativeElement as HTMLElement };
  }

  const removeButton = (element: HTMLElement) =>
    Array.from(element.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Remove from favorites'),
    );

  it('shows the large version of the same image and a remove button', async () => {
    const { element } = await open('/photos/abc', ['abc']);

    expect(element.querySelector('img')?.getAttribute('src')).toBe(
      'https://picsum.photos/seed/abc/800/1200',
    );
    expect(removeButton(element)).toBeDefined();
  });

  it('removes the photo, goes back to favorites and confirms with a snackbar', async () => {
    const { harness, element } = await open('/photos/abc', ['abc', 'def']);

    removeButton(element)!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(FavoritesStore).favorites()).toEqual(['def']);
    expect(TestBed.inject(Router).url).toBe('/favorites');
    const snackBar = await TestbedHarnessEnvironment.documentRootLoader(harness.fixture).getHarness(
      MatSnackBarHarness,
    );
    expect(await snackBar.getMessage()).toBe('Removed from favorites');
  });

  it('explains that an unknown or removed photo is not in favorites, with a way back', async () => {
    const { element } = await open('/photos/unknown', ['abc']);

    expect(element.querySelector('img')).toBeNull();
    expect(removeButton(element)).toBeUndefined();
    expect(element.textContent).toContain('not in your favorites');
    expect(element.querySelector('a[href="/favorites"]')).not.toBeNull();
  });

  it('shows a text placeholder if the image fails to load', async () => {
    const { harness, element } = await open('/photos/abc', ['abc']);

    element.querySelector('img')!.dispatchEvent(new Event('error'));
    await harness.fixture.whenStable();

    expect(element.querySelector('img')).toBeNull();
    expect(element.textContent).toContain('Image unavailable');
    expect(removeButton(element)).toBeDefined();
  });
});
