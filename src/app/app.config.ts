import { ApplicationConfig } from '@angular/core';

import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router + background preload
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // HTTP
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
