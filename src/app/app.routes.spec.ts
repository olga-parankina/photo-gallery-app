import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';

describe('app routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes, withComponentInputBinding())],
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
    await harness.navigateByUrl('/photos/abc');

    expect(harness.routeNativeElement?.textContent).toContain('abc');
  });

  it('redirects unknown URLs to the photo stream', async () => {
    await harness.navigateByUrl('/does-not-exist');

    expect(TestBed.inject(Router).url).toBe('/');
  });
});
