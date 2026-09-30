import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfiniteScroll } from './infinite-scroll.directive';
import { FakeIntersectionObserver } from '../../../testing/fake-intersection-observer';

@Component({
  imports: [InfiniteScroll],
  template: `<div appInfiniteScroll [paused]="paused()" (scrolled)="count = count + 1"></div>`,
})
class Host {
  readonly paused = signal(false);
  count = 0;
}

describe('InfiniteScroll', () => {
  let fixture: ComponentFixture<Host>;

  /** Where the sentinel's top edge is, in px from the top of the viewport. */
  function sentinelAt(top: number): void {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top } as DOMRect);
  }

  async function render(paused = false): Promise<Host> {
    fixture = TestBed.createComponent(Host);
    fixture.componentInstance.paused.set(paused);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  beforeEach(() => vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('emits when the sentinel comes into view', async () => {
    sentinelAt(5000);
    const host = await render();
    expect(host.count).toBe(0);

    FakeIntersectionObserver.latest.report(true);

    expect(host.count).toBe(1);
  });

  it('stays silent while paused (a load is already in flight)', async () => {
    sentinelAt(5000);
    const host = await render(true);

    FakeIntersectionObserver.latest.report(true);

    expect(host.count).toBe(0);
  });

  it('emits again after unpausing if the sentinel is still on screen (tall viewport)', async () => {
    sentinelAt(100);
    const host = await render(true);

    host.paused.set(false);
    await fixture.whenStable();

    expect(host.count).toBe(1);
  });

  it('does not emit after unpausing if the sentinel was pushed below the fold', async () => {
    sentinelAt(5000);
    const host = await render(true);

    host.paused.set(false);
    await fixture.whenStable();

    expect(host.count).toBe(0);
  });

  it('disconnects the observer when destroyed (no leak)', async () => {
    sentinelAt(5000);
    await render();
    const observer = FakeIntersectionObserver.latest;

    fixture.destroy();

    expect(observer.disconnect).toHaveBeenCalled();
  });
});
