/**
 * Test double for the browser IntersectionObserver (jsdom has none).
 * Install with `vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)`.
 */
export class FakeIntersectionObserver {
  static latest: FakeIntersectionObserver;
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.latest = this;
  }

  /** Simulates the browser reporting that the observed element entered/left the viewport. */
  report(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}
