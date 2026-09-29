import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { FakePhotoApi } from './core/photos/fake-photo-api';
import { PhotoApi } from './core/photos/photo-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    // Swap to a real HTTP implementation here; pages depend only on PhotoApi.
    { provide: PhotoApi, useClass: FakePhotoApi },
  ],
};
