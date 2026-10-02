import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ExperienceService } from '../../../core/services/experience';
import { Experience } from '../../../core/models/experience.model';

@Component({
  selector: 'app-experience',
  standalone: true,

  imports: [CommonModule, RouterLink],

  templateUrl: './experience.html',
  styleUrl: './experience.css',
})
export class ExperiencePage implements OnInit {
  // =====================================================
  // SERVICES
  // =====================================================

  private readonly experienceService = inject(ExperienceService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  // =====================================================
  // DATA
  // =====================================================

  experiences: Experience[] = [];

  isLoading = true;

  errorMessage = '';

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadExperiences();
  }

  // =====================================================
  // LOAD EXPERIENCES
  // =====================================================

  private loadExperiences(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.experienceService.getExperiences().subscribe({
      // =================================================
      // SUCCESS
      // =================================================

      next: (response: Experience[]) => {
        this.experiences = (response || [])
          .filter((experience: Experience) => experience.isActive !== false)
          .sort((a: Experience, b: Experience) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        this.isLoading = false;

        // Make sure SSR/hydration updates the UI immediately.
        this.changeDetectorRef.detectChanges();
      },

      // =================================================
      // ERROR
      // =================================================

      error: (error) => {
        console.error('Experience API Error:', error);

        this.experiences = [];

        this.errorMessage = 'Unable to load experience details.';

        this.isLoading = false;

        // Make sure error state is also rendered immediately.
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // =====================================================
  // CURRENT EXPERIENCE
  // =====================================================

  get currentExperience(): Experience | null {
    return (
      this.experiences.find((experience: Experience) => experience.isCurrent === true) ??
      this.experiences[0] ??
      null
    );
  }

  // =====================================================
  // EXPERIENCE COUNT
  // =====================================================

  get experienceCount(): number {
    return this.experiences.length;
  }

  // =====================================================
  // DATE FORMAT
  // =====================================================

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }

  // =====================================================
  // DATE RANGE
  // =====================================================

  getDateRange(experience: Experience): string {
    const start = this.formatDate(experience.startDate);

    if (experience.isCurrent) {
      return `${start} - Present`;
    }

    const end = this.formatDate(experience.endDate);

    return end ? `${start} - ${end}` : start;
  }

  // =====================================================
  // TECHNOLOGIES
  // =====================================================

  getTechnologies(experience: Experience): string[] {
    const data = experience as any;

    const technologies = data.technologies;

    // Array response
    if (Array.isArray(technologies)) {
      return technologies
        .map((technology: any) => {
          if (typeof technology === 'string') {
            return technology.trim();
          }

          return (technology?.technologyName || technology?.name || '').trim();
        })
        .filter((technology: string) => !!technology);
    }

    // String response
    if (typeof technologies === 'string') {
      return technologies
        .split(',')
        .map((technology: string) => technology.trim())
        .filter((technology: string) => !!technology);
    }

    return [];
  }

  // =====================================================
  // COMPANY URL
  // =====================================================

  getCompanyUrl(experience: Experience): string | null {
    const data = experience as any;

    const url = data.companyUrl;

    if (!url) {
      return null;
    }

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return null;
    }

    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }

    return `https://${trimmedUrl}`;
  }

  // =====================================================
  // TRACK BY
  // =====================================================

  trackByExperience(index: number, experience: Experience): number {
    return experience.experienceId ?? index;
  }
}
