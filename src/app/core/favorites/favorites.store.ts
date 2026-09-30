import { Injectable, inject, signal } from '@angular/core';

import { LocalStorageService } from '../storage/local-storage.service';

/** Versioned so a future format change can migrate or ignore old data. */
export const FAVORITES_STORAGE_KEY = 'photo-library.favorites.v1';

/** Exposed read-only, so every change goes through add/remove, which both persist. */
@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  private readonly storage = inject(LocalStorageService);
  private readonly ids = signal<readonly string[]>(this.restore());

  readonly favorites = this.ids.asReadonly();

  isFavorite(id: string): boolean {
    return this.ids().includes(id);
  }

  add(id: string): void {
    if (this.isFavorite(id)) return;
    this.ids.update((ids) => [...ids, id]);
    this.persist();
  }

  remove(id: string): void {
    this.ids.update((ids) => ids.filter((existing) => existing !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.write(FAVORITES_STORAGE_KEY, this.ids());
  }

  private restore(): readonly string[] {
    const stored = this.storage.read(FAVORITES_STORAGE_KEY);
    return isStringArray(stored) ? stored : [];
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
