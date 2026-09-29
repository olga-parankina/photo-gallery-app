import { Component, input } from '@angular/core';

@Component({
  selector: 'app-photo-detail-page',
  template: `<h1>Photo {{ id() }}</h1>`,
})
export default class PhotoDetailPage {
  /** Bound from the `:id` route param via withComponentInputBinding(). */
  readonly id = input.required<string>();
}
