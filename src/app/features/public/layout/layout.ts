import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ProfileService } from '../../../core/services/profile';
import { Profile } from '../../../core/models/profile.model';

@Component({
  selector: 'app-layout',
  standalone: true,

  imports: [CommonModule, RouterLink, RouterOutlet],

  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  private readonly profileService = inject(ProfileService);

  private readonly changeDetector = inject(ChangeDetectorRef);

  profile: Profile | null = null;

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
}
