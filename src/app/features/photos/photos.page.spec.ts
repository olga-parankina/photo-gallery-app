import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { Observable, Subject } from 'rxjs';

import { FavoritesStore } from '../../core/favorites/favorites.store';
import { PhotoApi } from '../../core/photos/photo-api';
import { Photo } from '../../core/photos/photo.model';
import PhotosPage from './photos.page';
import { FakeIntersectionObserver } from '../../../testing/fake-intersection-observer';

/** API whose responses the test releases by hand. */
class StubPhotoApi extends PhotoApi {
  readonly requests: Subject<Photo[]>[] = [];

  getPhotos(): Observable<Photo[]> {
    const response = new Subject<Photo[]>();
    this.requests.push(response);
    return response;
  }

  respond(ids: string[]): void {
    const response = this.requests.at(-1)!;
    response.next(ids.map((id) => ({ id })));
    response.complete();
  }
}

describe('PhotosPage', () => {
  let fixture: ComponentFixture<PhotosPage>;
  let api: StubPhotoApi;

  /** Top of the sentinel relative to the viewport: 0 = on screen, 5000 = far below. */
  function sentinelAt(top: number): void {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top } as DOMRect);
  }

  async function render(): Promise<void> {
    fixture = TestBed.createComponent(PhotosPage);
    await fixture.whenStable();
  }

  const element = () => fixture.nativeElement as HTMLElement;
  const cards = () => Array.from(element().querySelectorAll('app-photo-card button.tile'));
  const spinnerShown = () => element().querySelector('mat-progress-spinner') !== null;

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    api = new StubPhotoApi();
    TestBed.configureTestingModule({ providers: [{ provide: PhotoApi, useValue: api }] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads the first batch on open and shows the loader until it arrives', async () => {
    sentinelAt(0);
    await render();

    expect(api.requests).toHaveLength(1);
    expect(spinnerShown()).toBe(true);

    sentinelAt(5000);
    api.respond(['a', 'b', 'c']);
    await fixture.whenStable();

    expect(cards()).toHaveLength(3);
    expect(spinnerShown()).toBe(false);
  });

  it('ignores scroll signals while a batch is loading (no duplicate requests)', async () => {
    sentinelAt(0);
    await render();

    FakeIntersectionObserver.latest.report(true);
    FakeIntersectionObserver.latest.report(true);

    expect(api.requests).toHaveLength(1);
  });

  it('appends the next batch when the user scrolls to the sentinel', async () => {
    sentinelAt(0);
    await render();
    sentinelAt(5000);
    api.respond(['a', 'b']);
    await fixture.whenStable();

    FakeIntersectionObserver.latest.report(true);
    api.respond(['c', 'd']);
    await fixture.whenStable();

    expect(cards()).toHaveLength(4);
  });

  it('keeps loading while the sentinel is still on screen after a batch (tall viewport)', async () => {
    sentinelAt(0);
    await render();

    api.respond(['a']);
    await fixture.whenStable();

    expect(api.requests).toHaveLength(2);
  });

  it('adds a clicked photo to favorites and confirms with a snackbar', async () => {
    sentinelAt(0);
    await render();
    sentinelAt(5000);
    api.respond(['a', 'b']);
    await fixture.whenStable();

    (cards()[1] as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(TestBed.inject(FavoritesStore).favorites()).toEqual(['b']);
    const snackBar =
      await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(MatSnackBarHarness);
    expect(await snackBar.getMessage()).toBe('Added to favorites');
    expect(cards()[1].getAttribute('aria-label')).toBe('Photo is already in favorites');
  });

  it('guards loadMore itself, independent of the sentinel pause (one request in flight)', async () => {
    sentinelAt(5000);
    await render();
    const page = fixture.componentInstance;

    page['loadMore']();
    page['loadMore']();

    expect(api.requests).toHaveLength(1);
  });

  it('does nothing when an already favorite photo is clicked again (no second snackbar)', async () => {
    sentinelAt(0);
    await render();
    sentinelAt(5000);
    api.respond(['a']);
    await fixture.whenStable();
    const snackBarOpen = vi.spyOn(TestBed.inject(MatSnackBar), 'open');

    (cards()[0] as HTMLButtonElement).click();
    (cards()[0] as HTMLButtonElement).click();

    expect(snackBarOpen).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(FavoritesStore).favorites()).toEqual(['a']);
  });

  it('removes a favorite from the stream via its heart and offers Undo', async () => {
    sentinelAt(0);
    await render();
    sentinelAt(5000);
    api.respond(['a', 'b']);
    await fixture.whenStable();
    const store = TestBed.inject(FavoritesStore);
    (cards()[1] as HTMLButtonElement).click();
    await fixture.whenStable();

    element().querySelector<HTMLButtonElement>('button.badge')!.click();
    await fixture.whenStable();

    expect(store.favorites()).toEqual([]);
    expect(element().querySelector('button.badge')).toBeNull();
    const snackBar =
      await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(MatSnackBarHarness);
    expect(await snackBar.getMessage()).toBe('Removed from favorites');
    expect(await snackBar.getActionDescription()).toBe('Undo');

    await snackBar.dismissWithAction();

    expect(store.favorites()).toEqual(['b']);
  });

  it('after a failed request stops the loader, pauses the feed and offers a retry', async () => {
    sentinelAt(0);
    await render();

    api.requests[0].error(new Error('network down'));
    await fixture.whenStable();

    expect(spinnerShown()).toBe(false);
    expect(api.requests).toHaveLength(1);
    const retry = element().querySelector<HTMLButtonElement>('.error button')!;
    expect(retry.textContent).toContain('Try again');

    retry.click();
    await fixture.whenStable();

    expect(api.requests).toHaveLength(2);
  });
});
