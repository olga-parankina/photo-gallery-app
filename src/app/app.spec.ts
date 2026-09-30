import { TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';

import { FakeIntersectionObserver } from '../testing/fake-intersection-observer';
import { PhotoApi } from './core/photos/photo-api';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(() => vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver));
  afterEach(() => vi.unstubAllGlobals());

  it.each(['/', '/favorites', '/photos/abc'])(
    'shows the header and the routed page inside <main> on %s',
    async (url) => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter(routes, withComponentInputBinding()),
          // Routing tests care about navigation, not photos: an API that never answers.
          { provide: PhotoApi, useValue: { getPhotos: () => NEVER } },
        ],
      });
      const fixture = TestBed.createComponent(App);

      await TestBed.inject(Router).navigateByUrl(url);
      await fixture.whenStable();

      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('app-header nav')).not.toBeNull();
      expect(element.querySelector('main h1')).not.toBeNull();
    },
  );
});
