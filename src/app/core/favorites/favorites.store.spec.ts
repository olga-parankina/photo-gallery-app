import { TestBed } from '@angular/core/testing';

import { FAVORITES_STORAGE_KEY, FavoritesStore } from './favorites.store';

describe('FavoritesStore', () => {
  beforeEach(() => localStorage.clear());

  const createStore = () => TestBed.inject(FavoritesStore);
  const stored = () => JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? 'null');

  it('starts empty when nothing is stored', () => {
    expect(createStore().favorites()).toEqual([]);
  });

  it('adds a photo id and reports it as favorite', () => {
    const store = createStore();

    store.add('a');

    expect(store.favorites()).toEqual(['a']);
    expect(store.isFavorite('a')).toBe(true);
    expect(store.isFavorite('b')).toBe(false);
  });

  it('ignores adding the same id twice (idempotent add)', () => {
    const store = createStore();

    store.add('a');
    store.add('a');

    expect(store.favorites()).toEqual(['a']);
  });

  it('removes a photo id', () => {
    const store = createStore();
    store.add('a');
    store.add('b');

    store.remove('a');

    expect(store.favorites()).toEqual(['b']);
  });

  it('persists every change to localStorage', () => {
    const store = createStore();

    store.add('a');
    expect(stored()).toEqual(['a']);

    store.remove('a');
    expect(stored()).toEqual([]);
  });

  it('restores favorites saved by a previous session', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["a","b"]');

    expect(createStore().favorites()).toEqual(['a', 'b']);
  });

  it.each([
    ['corrupt JSON', '{not json'],
    ['an object', '{"a":1}'],
    ['a string', '"hello"'],
    ['non-string ids', '[1,2]'],
  ])('falls back to empty when storage holds %s', (_label, raw) => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, raw);

    expect(createStore().favorites()).toEqual([]);
  });
});
