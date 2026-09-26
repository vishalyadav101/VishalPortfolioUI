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

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (response: Profile) => {
        this.profile = response;

        this.isLoading = false;
      },

      error: (error) => {
        console.error('About Profile API Error:', error);

        this.isLoading = false;
      },
    });
  }

  get aboutImage(): string | null {
    return this.profile?.aboutImageUrl || this.profile?.profileImageUrl || null;
  }

  get experienceText(): string {
    if (this.profile?.availabilityStatus) {
      return this.profile.availabilityStatus;
    }

    return 'Full Stack Developer';
  }
}
