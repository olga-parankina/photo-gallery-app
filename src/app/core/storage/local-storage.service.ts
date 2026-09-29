import { Injectable } from '@angular/core';

/**
 * JSON over localStorage that never throws (see ADR-004).
 * Returns `unknown`: callers must validate the shape of what they read.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  /** Parsed value, or null if the key is missing, the JSON is corrupt or storage is unavailable. */
  read(key: string): unknown {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /** False if storage is full (quota) or blocked; the app keeps working in memory. */
  write(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
}
