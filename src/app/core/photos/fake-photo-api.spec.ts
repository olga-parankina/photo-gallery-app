import { TestBed } from '@angular/core/testing';

import { FakePhotoApi, RANDOM } from './fake-photo-api';
import { Photo } from './photo.model';

describe('FakePhotoApi', () => {
  function setup(random: () => number): FakePhotoApi {
    TestBed.configureTestingModule({
      providers: [FakePhotoApi, { provide: RANDOM, useValue: random }],
    });
    return TestBed.inject(FakePhotoApi);
  }

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('emits the requested number of photos after the minimum delay (200 ms)', () => {
    const api = setup(() => 0);
    let result: Photo[] | undefined;

    api.getPhotos(12).subscribe((photos) => (result = photos));

    vi.advanceTimersByTime(199);
    expect(result).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(result).toHaveLength(12);
  });

  it('never waits longer than the maximum delay (300 ms)', () => {
    const api = setup(() => 0.9999);
    let result: Photo[] | undefined;

    api.getPhotos(3).subscribe((photos) => (result = photos));

    vi.advanceTimersByTime(299);
    expect(result).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(result).toHaveLength(3);
  });

  it('gives every photo a unique id, across batches too', () => {
    const api = setup(() => 0);
    const ids: string[] = [];

    api.getPhotos(10).subscribe((photos) => ids.push(...photos.map((p) => p.id)));
    api.getPhotos(10).subscribe((photos) => ids.push(...photos.map((p) => p.id)));
    vi.advanceTimersByTime(300);

    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
  });

  it('emits nothing if unsubscribed before the response arrives (cancellation)', () => {
    const api = setup(() => 0);
    let result: Photo[] | undefined;

    const subscription = api.getPhotos(12).subscribe((photos) => (result = photos));
    subscription.unsubscribe();
    vi.advanceTimersByTime(300);

    expect(result).toBeUndefined();
  });
});
