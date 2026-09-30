import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Photo } from '../../../core/photos/photo.model';
import { PhotoCard } from './photo-card';

describe('PhotoCard', () => {
  let fixture: ComponentFixture<PhotoCard>;
  let element: HTMLElement;
  const photo: Photo = { id: 'abc' };

  async function render(inputs: { favorite?: boolean } = {}) {
    fixture = TestBed.createComponent(PhotoCard);
    fixture.componentRef.setInput('photo', photo);
    fixture.componentRef.setInput('label', 'Add photo to favorites');
    if (inputs.favorite !== undefined) fixture.componentRef.setInput('favorite', inputs.favorite);
    await fixture.whenStable();
    element = fixture.nativeElement;
  }

  const button = () => element.querySelector('button')!;
  const image = () => element.querySelector('img');

  it('is a button named by the action it performs', async () => {
    await render();

    expect(button().getAttribute('aria-label')).toBe('Add photo to favorites');
    expect(button().type).toBe('button');
  });

  it('shows the thumbnail with fixed size, lazy loading and empty alt', async () => {
    await render();

    expect(image()?.getAttribute('src')).toBe('https://picsum.photos/seed/abc/200/300');
    expect(image()?.getAttribute('width')).toBe('200');
    expect(image()?.getAttribute('height')).toBe('300');
    expect(image()?.getAttribute('loading')).toBe('lazy');
    expect(image()?.getAttribute('alt')).toBe('');
  });

  it('emits the photo when clicked', async () => {
    await render();
    const selected: Photo[] = [];
    fixture.componentInstance.selected.subscribe((p) => selected.push(p));

    button().click();

    expect(selected).toEqual([photo]);
  });

  it('marks favorites with a badge only when favorite is true', async () => {
    await render();
    expect(element.querySelector('.badge')).toBeNull();

    fixture.componentRef.setInput('favorite', true);
    await fixture.whenStable();

    expect(element.querySelector('.badge')).not.toBeNull();
  });

  it('makes the favorite heart its own button that emits unfavorite, not selected', async () => {
    await render({ favorite: true });
    const selected: Photo[] = [];
    const unfavorited: Photo[] = [];
    fixture.componentInstance.selected.subscribe((p) => selected.push(p));
    fixture.componentInstance.unfavorite.subscribe((p) => unfavorited.push(p));

    const heart = element.querySelector<HTMLButtonElement>('button.badge')!;
    heart.click();

    expect(heart.getAttribute('aria-label')).toBe('Remove from favorites');
    expect(heart.type).toBe('button');
    expect(unfavorited).toEqual([photo]);
    expect(selected).toEqual([]);
  });

  it('moves focus to the tile after the heart is used, so keyboard users keep their place', async () => {
    await render({ favorite: true });
    const heart = element.querySelector<HTMLButtonElement>('button.badge')!;
    heart.focus();

    heart.click();

    expect(document.activeElement).toBe(element.querySelector('button.tile'));
  });

  it('marks the tile aria-disabled only while the photo is already a favorite', async () => {
    await render();
    expect(button().hasAttribute('aria-disabled')).toBe(false);

    fixture.componentRef.setInput('favorite', true);
    await fixture.whenStable();

    expect(button().getAttribute('aria-disabled')).toBe('true');
  });

  it('does not nest the heart button inside the tile button (valid HTML)', async () => {
    await render({ favorite: true });

    expect(element.querySelector('button button')).toBeNull();
  });

  it('replaces a broken image with a text placeholder (no fallback image loop)', async () => {
    await render();

    image()!.dispatchEvent(new Event('error'));
    await fixture.whenStable();

    expect(image()).toBeNull();
    expect(element.textContent).toContain('Image unavailable');
  });
});
