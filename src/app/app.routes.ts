import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  // =====================================================
  // PUBLIC LAYOUT
  // Navbar + Footer common rahenge
  // =====================================================
  {
    path: '',
    loadComponent: () => import('./features/public/layout/layout').then((m) => m.Layout),

    children: [
      // =========================
      // HOME
      // =========================
      {
        path: '',
        loadComponent: () => import('./features/public/home/home').then((m) => m.Home),
      },

      // =========================
      // ABOUT
      // =========================
      {
        path: 'about',
        loadComponent: () => import('./features/public/about/about').then((m) => m.About),
      },

      // =========================
      // PROJECTS
      // =========================
      {
        path: 'projects',
        loadComponent: () => import('./features/public/projects/projects').then((m) => m.Projects),
      },

      // =========================
      // EXPERIENCE
      // =========================
      {
        path: 'experience',
        loadComponent: () =>
          import('./features/public/experience/experience').then((m) => m.ExperiencePage),
      },

      // =========================
      // SKILLS
      // =========================
      {
        path: 'skills',
        loadComponent: () => import('./features/public/skills/skills').then((m) => m.Skills),
      },

      // =========================
      // CERTIFICATES
      // =========================
      {
        path: 'certificates',
        loadComponent: () =>
          import('./features/public/certificates/certificates').then((m) => m.Certificates),
      },

      // =========================
      // BLOG
      // =========================
      {
        path: 'blog',
        loadComponent: () => import('./features/public/blog/blog').then((m) => m.Blog),
      },

      // =========================
      // CONTACT
      // =========================
      {
        path: 'contact',
        loadComponent: () => import('./features/public/contact/contact').then((m) => m.Contact),
      },
    ],
  },

  // =====================================================
  // ADMIN LOGIN
  // Layout ke bahar rahega
  // =====================================================
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login').then((m) => m.Login),
  },

  // =====================================================
  // PROTECTED ADMIN ROUTES
  // =====================================================

  // =========================
  // ADMIN DASHBOARD
  // =========================
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
  },

  // =========================
  // ADMIN PROFILE
  // =========================
  {
    path: 'admin/profile',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/profile/profile').then((m) => m.Profile),
  },

  // =========================
  // ADMIN SKILLS
  // =========================
  {
    path: 'admin/skills',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/skills/skills').then((m) => m.Skills),
  },

  // =========================
  // ADMIN PROJECTS
  // =========================
  {
    path: 'admin/projects',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/projects/projects').then((m) => m.Projects),
  },

  // =========================
  // ADMIN EXPERIENCE
  // =========================
  {
    path: 'admin/experience',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/experience/experience').then((m) => m.Experience),
  },

  // =========================
  // ADMIN CERTIFICATES
  // =========================
  {
    path: 'admin/certificates',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/certificates/certificates').then((m) => m.Certificates),
  },

  // =========================
  // ADMIN SOCIAL LINKS
  // =========================
  {
    path: 'admin/social-links',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/social-links/social-links').then((m) => m.SocialLinks),
  },

  // =========================
  // ADMIN BLOG
  // =========================
  {
    path: 'admin/blog',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/blog/blog').then((m) => m.Blog),
  },

  // =========================
  // ADMIN CONTACTS
  // =========================
  {
    path: 'admin/contacts',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/contacts/contacts').then((m) => m.Contacts),
  },

  // =====================================================
  // FALLBACK
  // =====================================================
  {
    path: '**',
    redirectTo: '',
  },
];
