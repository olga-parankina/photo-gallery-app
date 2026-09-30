import { TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { FakeIntersectionObserver } from '../testing/fake-intersection-observer';
import { routes } from './app.routes';
import { FavoritesStore } from './core/favorites/favorites.store';
import { PhotoApi } from './core/photos/photo-api';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });
  afterEach(() => vi.unstubAllGlobals());

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        // Routing tests care about navigation, not photos: an API that never answers.
        { provide: PhotoApi, useValue: { getPhotos: () => NEVER } },
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  it.each([
    ['/', 'Photos'],
    ['/favorites', 'Favorites'],
  ])('renders the %s page', async (url, heading) => {
    await harness.navigateByUrl(url);

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(heading);
  });

  it('passes the :id route param into the photo detail page', async () => {
    TestBed.inject(FavoritesStore).add('abc');

    await harness.navigateByUrl('/photos/abc');

    expect(harness.routeNativeElement?.querySelector('img')?.getAttribute('src')).toContain(
      '/seed/abc/',
    );
  });

  it('redirects unknown URLs to the photo stream', async () => {
    await harness.navigateByUrl('/does-not-exist');

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
