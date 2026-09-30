import { Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

/**
 * Loading indicator. The status region always exists (screen readers only announce
 * changes inside a live region that was already in the DOM); only its content toggles.
 */
@Component({
  selector: 'app-loader',
  imports: [MatProgressSpinner],
  template: `
    <div class="loader" role="status">
      @if (active()) {
        <mat-progress-spinner mode="indeterminate" diameter="40" aria-hidden="true" />
        <span>Loading…</span>
      }
    </div>
  `,
  styles: `
    .loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-height: 72px;
      padding-block: 16px;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class Loader {
  readonly active = input(false);
}
