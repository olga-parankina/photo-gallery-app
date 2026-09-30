import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';

import { Loader } from './loader';

describe('Loader', () => {
  let fixture: ComponentFixture<Loader>;

  async function render(active: boolean) {
    fixture = TestBed.createComponent(Loader);
    fixture.componentRef.setInput('active', active);
    await fixture.whenStable();
    return TestbedHarnessEnvironment.loader(fixture);
  }

  const status = () => (fixture.nativeElement as HTMLElement).querySelector('[role="status"]');

  it('shows a spinner and announces loading while active', async () => {
    const loader = await render(true);

    expect(await loader.hasHarness(MatProgressSpinnerHarness)).toBe(true);
    expect(status()?.textContent).toContain('Loading');
  });

  it('keeps the live region in the DOM but empty when idle, so the next change is announced', async () => {
    const loader = await render(false);

    expect(await loader.hasHarness(MatProgressSpinnerHarness)).toBe(false);
    expect(status()).not.toBeNull();
    expect(status()?.textContent?.trim()).toBe('');
  });
});
