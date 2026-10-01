import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ProfileService } from '../../../core/services/profile';
import { Profile } from '../../../core/models/profile.model';

@Component({
  selector: 'app-layout',
  standalone: true,

  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],

  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  private readonly profileService = inject(ProfileService);

  private readonly changeDetector = inject(ChangeDetectorRef);

  profile: Profile | null = null;

  // Mobile menu state
  isMobileMenuOpen = false;

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (response: Profile) => {
        this.profile = response;

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error('Layout Profile API Error:', error);

        this.profile = null;

        this.changeDetector.detectChanges();
      },
    });
  }

  // Toggle hamburger menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Close menu after clicking a menu link
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Close menu when clicking outside mobile navbar
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Click navbar ke andar hai
    if (target.closest('.mobile-nav')) {
      return;
    }

    // Navbar ke bahar click hua
    this.isMobileMenuOpen = false;
  }
}
