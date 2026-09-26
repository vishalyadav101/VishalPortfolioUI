import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Admin pages -> Client Side Rendering
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },

  // Public pages -> Prerender for SEO
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
