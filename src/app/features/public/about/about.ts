import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProfileService } from '../../../core/services/profile';
import { Profile } from '../../../core/models/profile.model';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  private readonly profileService = inject(ProfileService);

  profile: Profile | null = null;

  isLoading = true;

  // ==========================================
  // COMPONENT INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.loadProfile();
  }

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  private loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (response: Profile) => {
        this.profile = response;
        this.isLoading = false;
      },

      error: (error) => {
        console.error('About Profile API Error:', error);

        this.profile = null;
        this.isLoading = false;
      },
    });
  }

  // ==========================================
  // PROFILE IMAGE
  // ==========================================

  get profileImage(): string | null {
    const imageUrl = this.profile?.profileImageUrl;

    if (!imageUrl) {
      return null;
    }

    const trimmedUrl = imageUrl.trim();

    if (!trimmedUrl) {
      return null;
    }

    return trimmedUrl;
  }

  // ==========================================
  // ABOUT IMAGE
  // ==========================================

  get aboutImage(): string | null {
    const imageUrl = this.profile?.aboutImageUrl;

    if (!imageUrl) {
      return null;
    }

    const trimmedUrl = imageUrl.trim();

    if (!trimmedUrl) {
      return null;
    }

    return trimmedUrl;
  }

  // ==========================================
  // EXPERIENCE / AVAILABILITY
  // ==========================================

  get experienceText(): string {
    if (this.profile?.availabilityStatus) {
      return this.profile.availabilityStatus;
    }

    return 'Full Stack Developer';
  }
}