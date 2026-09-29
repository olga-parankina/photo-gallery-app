import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('returns null for a missing key', () => {
    expect(service.read('missing')).toBeNull();
  });

  it('writes a value as JSON and reads it back', () => {
    expect(service.write('key', ['a', 'b'])).toBe(true);

    expect(localStorage.getItem('key')).toBe('["a","b"]');
    expect(service.read('key')).toEqual(['a', 'b']);
  });

  it('returns null instead of throwing when stored JSON is corrupt', () => {
    localStorage.setItem('key', '{not json');

    expect(service.read('key')).toBeNull();
  });

  it('returns false instead of throwing when storage is full or blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    expect(service.write('key', ['a'])).toBe(false);
  });
});
