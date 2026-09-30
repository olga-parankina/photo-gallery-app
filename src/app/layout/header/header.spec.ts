import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Header } from './header';

/** The header only cares about URLs, so real pages are replaced by an empty stub. */
@Component({ template: '' })
class BlankPage {}

const routes = [
  { path: '', component: BlankPage },
  { path: 'favorites', component: BlankPage },
  { path: 'photos/:id', component: BlankPage },
];

describe('Header', () => {
  async function setup(url: string) {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const router = await RouterTestingHarness.create(url);
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
    const loader = TestbedHarnessEnvironment.loader(fixture);
    return { router, fixture, loader };
  }

  async function activeButtons(loader: Awaited<ReturnType<typeof setup>>['loader']) {
    const active: string[] = [];
    for (const button of await loader.getAllHarnesses(MatButtonHarness)) {
      const host = await button.host();
      if ((await host.getAttribute('aria-current')) === 'page') {
        expect(await button.getAppearance()).toBe('filled');
        active.push(await button.getText());
      }
    }
    return active;
  }

  it.each([
    ['/', 'Photos'],
    ['/favorites', 'Favorites'],
    // The detail page only shows favorite photos.
    ['/photos/abc', 'Favorites'],
  ])('on %s highlights only %s', async (url, expected) => {
    const { loader } = await setup(url);

    expect(await activeButtons(loader)).toEqual([expected]);
  });

  it('moves the highlight when the user navigates', async () => {
    const { router, fixture, loader } = await setup('/');

    await router.navigateByUrl('/favorites');
    await fixture.whenStable();

    expect(await activeButtons(loader)).toEqual(['Favorites']);
  });

  it('links to the photo stream and to favorites', async () => {
    const { loader } = await setup('/');
    const hrefs = [];
    for (const button of await loader.getAllHarnesses(MatButtonHarness)) {
      hrefs.push(await (await button.host()).getAttribute('href'));
    }

    expect(hrefs).toEqual(['/', '/favorites']);
  });
});
