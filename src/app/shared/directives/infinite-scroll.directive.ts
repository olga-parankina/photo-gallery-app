import {
  DestroyRef,
  Directive,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  output,
} from '@angular/core';

/** Start loading this many px before the sentinel actually reaches the viewport. */
const PREFETCH_PX = 300;

/**
 * Put on a sentinel element below a list; emits `scrolled` when more items should load
 * (hand-written, see ADR-003).
 */
@Directive({ selector: '[appInfiniteScroll]' })
export class InfiniteScroll {
  /** True while a load is in flight: nothing is emitted. */
  readonly paused = input(false);
  readonly scrolled = output<void>();

  private readonly sentinel = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !this.paused()) this.scrolled.emit();
      },
      { rootMargin: `0px 0px ${PREFETCH_PX}px 0px` },
    );
    observer.observe(this.sentinel);
    inject(DestroyRef).onDestroy(() => observer.disconnect());

    // The observer only reports changes. If a batch did not push the sentinel off screen
    // (tall viewport, zoomed out), nothing changes. This effect reads `paused()`, so it re-runs
    // after the render that follows every flip to unpaused (i.e. after each batch) and re-checks.
    afterRenderEffect({
      read: () => {
        if (!this.paused() && this.isNearViewport()) this.scrolled.emit();
      },
    });
  }

  private isNearViewport(): boolean {
    return this.sentinel.getBoundingClientRect().top <= window.innerHeight + PREFETCH_PX;
  }
}
