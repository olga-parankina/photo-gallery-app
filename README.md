# Photo Gallery App

An Angular app with an endless stream of random photos and a personal favorites collection.
Click a photo in the stream to save it; changed your mind? Click its heart (with Undo). Open **Favorites** to see everything you saved. Click a
favorite to view it large and remove it. Favorites are kept in `localStorage`, so they survive a
page refresh. There is no backend.

## Quick start

Prerequisites: **Node.js ≥ 24.15** (or ≥ 22.22.3) and npm. Angular CLI 22 refuses older Node
versions, and `engine-strict` in `.npmrc` makes `npm install` stop early on an older Node.

```bash
npm install
npm start            # http://localhost:4200
```

| Command                | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm test`             | Unit and component tests (Vitest), single run |
| `npm run test:watch`   | Tests in watch mode                           |
| `npm run lint`         | ESLint (angular-eslint, TS and templates)     |
| `npm run format:check` | Prettier check (`npm run format` to fix)      |
| `npm run build`        | Production build into `dist/`                 |

CI (GitHub Actions) runs format check, lint, tests and build on every push and pull request.

## Requirements → implementation

| Requirement                                                           | Where                                                                        | Tests                                                      |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Header with Photos / Favorites, active view marked                    | `layout/header/`                                                             | `header.spec.ts`                                           |
| `/`: endless grid, click adds to favorites                            | `features/photos/photos.page.*`                                              | `photos.page.spec.ts`                                      |
| Loader while the next batch loads                                     | `shared/ui/loader/`                                                          | `loader.spec.ts`, `photos.page.spec.ts`                    |
| Emulated API with a random 200–300 ms delay                           | `core/photos/fake-photo-api.ts` behind `PhotoApi`                            | `fake-photo-api.spec.ts`                                   |
| Infinite scroll written by hand, no library                           | `shared/directives/infinite-scroll.directive.ts`                             | `infinite-scroll.directive.spec.ts`                        |
| `/favorites`: all favorites, click opens the photo                    | `features/favorites/favorites.page.ts`                                       | `favorites.page.spec.ts`                                   |
| Favorites survive a refresh, no backend                               | `core/favorites/favorites.store.ts`, `core/storage/local-storage.service.ts` | `favorites.store.spec.ts`, `local-storage.service.spec.ts` |
| `/photos/:id`: one large photo + "Remove from favorites", same header | `features/photo-detail/`                                                     | `photo-detail.page.spec.ts`                                |
| Angular Router, lazy routes                                           | `app.routes.ts`                                                              | `app.routes.spec.ts`, `app.spec.ts`                        |
| Latest Angular, SCSS, Angular Material                                | Angular 22, `styles.scss` (Material M3 theme)                                | —                                                          |
| Unit tests                                                            | 69 tests across 14 spec files                                                | `npm test`                                                 |

## Architecture

```
src/app/
  core/                 app-wide logic and state, no UI
    photos/             Photo model, photoUrl(), PhotoApi (abstract) + FakePhotoApi
    favorites/          FavoritesStore (signals, persisted)
    storage/            LocalStorageService (JSON, never throws)
  layout/header/        navigation with active state
  shared/               reusable, presentational only (inputs in, outputs out)
    ui/                 photo-card, photo-grid, loader
    directives/         infiniteScroll
  features/             one folder per route; pages are the "smart" components
    photos/  favorites/  photo-detail/
  app.routes.ts · app.config.ts
src/testing/            test doubles shared by specs (excluded from the app build)
```

Rules: features may use `core` and `shared`. `shared` never touches stores or the router. Features
never import each other.

**Stack.** Angular 22 with standalone components (no NgModules; I read "modules" in the task as
"modular structure"), zoneless change detection and OnPush (both are Angular 22 defaults), signals
for state, RxJS only for the async API stream, Angular Material 3 themed through design tokens in
one file, Vitest, strict TypeScript and strict templates (defaults in TS 6 and Angular 22),
ESLint, Prettier. No runtime dependencies beyond Angular, Material and RxJS.

The assessment's starter repository contained an empty Angular 16 template (NgModules, Karma). It
was replaced with a fresh Angular 22 workspace because the task asks for the latest Angular.

## Decisions

Each decision records context, alternatives, trade-offs and when to revisit it:

1. [Photo identity and image source](docs/adr/001-photo-identity-and-image-source.md): seeded
   picsum URLs derived from a random UUID; only ids are stored.
2. [`PhotoApi` abstraction](docs/adr/002-photo-api-abstraction.md): a fake with a real-looking
   delay; switching to a backend is a one-line provider change.
3. [Hand-written infinite scroll](docs/adr/003-hand-written-infinite-scroll.md): an
   `IntersectionObserver` sentinel plus a re-check for tall viewports.
4. [Favorites state and persistence](docs/adr/004-favorites-state-and-persistence.md): a
   signal store with one writer, validated `localStorage`, no state library.
5. [Routing and the detail page](docs/adr/005-routing-and-detail-page.md): lazy routes, the
   header highlights Favorites on the detail page, a not-found state.
6. [Click-to-favorite UX](docs/adr/006-click-to-favorite-ux.md): real buttons named by their
   action, presentational components.
7. [Testing strategy](docs/adr/007-testing-strategy.md).

## Edge cases handled

- Fast scrolling or concurrent triggers: only one request at a time (guard + paused sentinel).
- A failed request resets the loader (`finalize`), pauses the feed and offers "Try again", so there
  is no retry loop.
- Tall viewports or zoomed-out browsers keep loading until the page can scroll.
- Leaving the page mid-request cancels it (`takeUntilDestroyed`); the observer is disconnected.
- Broken images show a text placeholder at the same size (no layout shift, no `onerror` loop).
- Corrupt, missing or wrongly shaped `localStorage` data falls back to an empty list; a full
  storage does not crash the app.
- Duplicate favorites are ignored; an empty Favorites page explains what to do.
- Changed your mind: the heart on a favorite tile removes it, with Undo in the snackbar.
- Unknown or already removed ids on `/photos/:id` show a clear "not in your favorites" state.
- Direct navigation and refresh work on every route; unknown URLs redirect to `/`.

## Accessibility and performance

- Every tile is a `<button>` named by its action; keyboard works end to end, with a visible focus
  ring.
- `aria-current="page"` on the active nav button, a persistent `role="status"` region for the
  loader, a heading and a document title on every page.
- Text contrast ≥ 7.7:1 for every color pair (checked with the WCAG formula).
- Fixed image dimensions (no layout shift), `loading="lazy"`, `track` by id, lazy route chunks.
- Responsive grid: 2 columns on phones, 3 from 720 px, as in the wireframe.

## Known limitations

- The stream is random and is not saved: after a refresh it shows new photos, while favorites stay.
- Picsum has about a thousand images, so two different ids can show the same picture.
- The detail page follows the wireframe (photo at content width, fitted to the screen) rather than
  a literal full-screen photo.
- The DOM grows as you scroll (no virtualization); fine for hundreds of photos.
- Favorites do not sync between open tabs until a reload.
- Ids come from `crypto.randomUUID()`, which browsers expose only in secure contexts: open the app
  on `localhost` or over HTTPS (not `http://<LAN-IP>:4200` from a phone).

## What I would do with more time

- Undo for "Remove from favorites" on the detail page too (the stream already has it).
- Cross-tab sync through the `storage` event.
- A Playwright smoke test for the main flow, and a deployed demo on GitHub Pages.
- Dark theme (the tokens are already in one place).
- A shimmer skeleton on tiles while their image loads (the loader for the batch itself stays,
  as the task asks for a loader icon).
- Photo metadata (author, links) through picsum's list API, without changing the pages.

## How I worked

Test-first for every service, the store, the directive and each page: write the test, watch it
fail, then implement. Test and code are committed together, so history and CI never go red. Key
tests were mutation-checked by breaking the code on purpose. Commits follow Conventional Commits.
Format check, lint, tests and a production build ran before commits, and CI runs them on every push. Flows were also checked
by hand in a browser: fresh storage, refresh on every route, 375 px width, keyboard only.
