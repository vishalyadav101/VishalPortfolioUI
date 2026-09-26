import {
  Component,
  ChangeDetectorRef,
  inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  AuthService,
  LoginResponse
} from '../../../core/services/auth';

import { DashboardService } from '../../../core/services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly dashboardService =
    inject(DashboardService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  user: LoginResponse | null = null;

  projectCount = 0;
  skillCount = 0;
  blogCount = 0;
  contactCount = 0;

  isLoading = true;

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.user = this.authService.getUser();

    this.loadProjects();
    this.loadSkills();
    this.loadBlogs();
    this.loadContacts();
  }

  private loadProjects(): void {

    this.dashboardService
      .getProjects()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.projectCount = data.length;
        },

        error: (error) => {
          console.error(
            'Projects API Error:',
            error
          );

          this.projectCount = 0;
        }
      });
  }

  private loadSkills(): void {

    this.dashboardService
      .getSkills()
      .subscribe({
        next: (data) => {
          this.skillCount = data.length;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Skills API Error:',
            error
          );

          this.skillCount = 0;
        }
      });
  }

  private loadBlogs(): void {

    this.dashboardService
      .getBlogs()
      .subscribe({
        next: (data) => {
          this.blogCount = data.length;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Blog API Error:',
            error
          );

          this.blogCount = 0;
        }
      });
  }

  private loadContacts(): void {

    this.dashboardService
      .getContacts()
      .subscribe({
        next: (data) => {
          this.contactCount = data.length;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Contact API Error:',
            error
          );

          this.contactCount = 0;
        }
      });
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/admin/login'
    ]);
  }
}